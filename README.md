# Coffeescript Linter 

## Required to work 
- Create an eslint config (https://eslint.org/)
- Pipe files separated by a newline `\n` into command coffee-lint


## Description 
This is a simple linter that uses eslint to lint the javascript files produced by coffeescript. 

The intention for this package is to remain a wrapper for simply mapping errors from coffeescript & eslint. 
All of the configuration is handled by an eslint config. 

The package uses standard input for the files. The expectation here is that files are seperated by a newline `\n`

For example, and my personal use case,  is I need to only lint the coffeescript files that are actually changed. So to do that we type the following command.

#### Using the Pipe (`|`) operator we can pass output into the next command. 
```
git ls-files --exclude="node_modules/" -m -o | grep "**/*.coffee" | coffee-lint
```

#### This section produces a list of files excluding node_modules
`git ls-files --exclude="node_modules" -m -o`

#### This uses a glob pattern to only grab coffeescript files
```
 grep "**/*.coffee" 
 ```

#### This is the actual program taking in the piped input
```
coffee-lint
```

#### This package currently uses the stylish formatter for outputting errors, example below:

```

/var/lib/jenkins/workspace/Releases/eslint Release/eslint/fullOfProblems.js
  1:10  error    'addOne' is defined but never used            no-unused-vars
  2:9   error    Use the isNaN function to compare with NaN    use-isnan
  3:16  error    Unexpected space before unary operator '++'   space-unary-ops
  3:20  warning  Missing semicolon                             semi
  4:12  warning  Unnecessary 'else' after 'return'             no-else-return
  5:1   warning  Expected indentation of 8 spaces but found 6  indent
  5:7   error    Function 'addOne' expected a return value     consistent-return
  5:13  warning  Missing semicolon                             semi
  7:2   error    Unnecessary semicolon                         no-extra-semi

✖ 9 problems (5 errors, 4 warnings)
  2 errors and 4 warnings potentially fixable with the `--fix` option.
  ````

## <a href="https://github.com/Airik-Leon/coffee-linter">For code review or to open a pull request visit repo here</a>
