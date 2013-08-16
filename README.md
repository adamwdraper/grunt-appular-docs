# grunt-appular-docs

> Generate documentation for Appular projects with source comments

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-appular-docs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-appular-docs');
```

## The "docs" task

### Overview
In your project's Gruntfile, add a section named `docs` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  docs: {
    build: {
      options: {
        // Task-specific options go here.
      },
      files: {
        // Target-specific file lists and/or options go here.
      }
    }
  }
})
```

### Options

#### options.pretty
Type: `Boolean`
Default value: `false`

If `true` generated JSON will be pretty.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  docs: {
    build: {
      options: {},
      files: {
        'dest/default_options': ['src/path/to/appular/folder/**/*.js'],
      }
    }
  }
})
```

#### Custom Options

```js
grunt.initConfig({
  docs: {
    build: {
      options: {
        pretty: true
      },
      files: {
        'dest/default_options': ['src/path/to/appular/folder/**/*.js'],
      }
    }
  }
})
```

## Docs

Documentation for this task to extract can be added by using inline commenting using the tags documented below.

### Document Blocks

#### @appular

```js
/*
 * @appular name [version][ - description]
 */
```

The @appular block needs to appear at the top of any module that you want to document. Avaliable tags to use in this block include:

* @define path/used/in/requirejs
* @link http://url.documentation.com

Example - Defining and appular module named user bar

```js
/*
 * @appular userBar v1.0.1 - designed to store variables for apps.
 * @define modules/user-bar/module
 * @link http://www.mysite.com
 */
```

#### @function

```js
/*
 * @function name[ - description]
 */
```

The @function tag can appear anywhere inside a module.

Example - Defining a function named render

```js
/*
 * @function render - creates and inserts html for module
 */
```

#### @event

```js
/*
 * @event name[ - description]
 */
```

The @event tag can appear anywhere inside a module.

Example - Defining a event named rendered

```js
/*
 * @event rendered - fired when html is rendered
 */
```

Formatting requirements

* name
  * required 
  * camelcased
* version
  * optional 
  * needs to be in the format of `v1.2.3` or `v1.0`
* description
  * optional
  * needs to be preseeded by ` - ` for parser to recognize it.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

