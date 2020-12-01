#!/usr/bin/env node
const coffee = require("coffeescript");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { ESLint } = require("eslint");
const sourceMap = require("source-map");
const chalk = require("chalk");

function execute(command) {
  return new Promise((resolve) => {
    exec(command, (err, stdout, stderr) => {
      if (stdout) {
        console.log(stdout);
        resolve(stdout);
      } else {
        if (err) console.log(err);
        if (stderr) console.log(err);
        resolve(null);
      }
    });
  });
}

async function main() {
  const eslint = new ESLint({ fix: true });

  const paths =
    (await new Promise((resolve) => {
      process.stdin.on("data", (data) => {
        resolve(
          String(data)
            .split("\n")
            .map((v) => v.trim())
            .filter((b) => Boolean(b))
            .map((f) => path.resolve(f))
        );
      });
    })) || [];

  const sources = paths.reduce((acc, curr) => {
    const file = fs.readFileSync(curr, "utf-8");
    try {
      acc[curr] = coffee.compile(file, {
        sourceMap: true,
        bare: true,
        header: false,
      });
    } catch (e) {
      const { location } = e;
      console.log(chalk.green(curr));
      console.log(
        [
          `${location.first_line + 1}:${location.first_column + 1}`,
          chalk.red("error"),
          e.toString(),
        ].join("\t")
      );
      process.exit(1);
    }

    return acc;
  }, {});
  await Promise.all(
    Object.entries(sources).map(async ([filePath, source]) => {
      const jsPath = filePath.replace(".coffee", ".js");
      fs.writeFileSync(jsPath, source.js);
      source.filePath = filePath;
      source.jsPath = jsPath;
      source.lintMap = await new sourceMap.SourceMapConsumer(
        source.v3SourceMap
      );
      return source;
    })
  );

  const jsPaths = paths.map((p) => p.replace(".coffee", ".js"));

  const results = await eslint.lintFiles(jsPaths);

  const mappedResults = results.map((r) => {
    const source = Object.values(sources).find((s) => s.jsPath === r.filePath);
    const { lintMap } = source;
    const messages = r.messages.map((message) => {
      const startOfLine = lintMap.originalPositionFor({
        line: message.line,
        column: message.column,
      });
      const endOfLine = lintMap.originalPositionFor({
        line: message.endLine,
        column: message.endColumn,
      });

      return {
        ...message,
        line: startOfLine.line,
        column: startOfLine.column,
        endColumn: endOfLine.column,
        endLine: endOfLine.line,
      };
    });

    return {
      ...r,
      filePath: source.filePath,
      messages,
    };
  });

  if (results.filter(r => r.errorCount > 0).length > 0) {
    const formatter = await eslint.loadFormatter("stylish");
    console.log(formatter.format(mappedResults));
    await Promise.all(jsPaths.map((f) => execute(`npx rimraf ${f}`)));
    process.exit(1);
  }
  process.exit(0);
}

main();
