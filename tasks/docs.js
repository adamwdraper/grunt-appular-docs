/*
 * appular-docs
 * https://github.com/adamwdraper/grunt-appular-docs
 *
 * Copyright (c) 2013 Adam Draper
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    var fs = require('fs'),
        _ = require('underscore');

    grunt.registerMultiTask('docs', 'Generate documentation for appular projects with source comments', function() {

        var options = this.options({
                pretty: false
            }),
            output = {},
            regExpEscape = function(string) {
                return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            },
            extract = {
                tag: function (line) {
                    return line.match(/^@(\w)+/gi)[0].slice(1);
                },
                name: function (line) {
                    return line.split(' ')[1];
                },
                version: function (line) {
                    return line.match(/v[\d\.]+/gi)[0];
                },
                description: function(line) {
                    return line.indexOf(' - ') !== -1 ? line.match(/- (.)*/gi)[0].slice(2) : '';
                },
                last: function (line) {
                    return line.match(/[^\s]+$/gi)[0];
                }
            };

        this.files.forEach(function(file) {
            var origSrc = file.orig.src[0].match(/^[^*]+/g)[0],
                re = new RegExp(regExpEscape(origSrc) + '\/?', 'g');

            grunt.log.writeln().writeln('searching in ' + origSrc + '...').writeln().writeln('documentation found in:').writeln();

            file.src.forEach(function(path) {
                var data = grunt.file.read(path),
                    define = path.replace(re, ''),
                    directories = define.split('/'),
                    file = directories.pop(),
                    comments,
                    newParent,
                    parent,
                    module = {},
                    tempModule = {};

                if (data.indexOf('@appular') !== -1) {
                    // docs found
                    grunt.log.writeln(define);

                    // gets all multi line comments in file
                    comments = data.match(/\/\*+([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//gm);

                    comments.forEach(function(comment) {
                        var doc = {};
                        
                        // extracts all lines with a tag
                        doc.lines = comment.match(/(@.*[^\r\n])/g);

                        if (doc.lines) {
                            doc.lines.forEach(function(line) {
                                var tag;

                                line.trim();

                                tag = extract.tag(line);

                                switch (tag) {
                                    case 'appular':
                                        _.extend(tempModule, {
                                            name: extract.name(line),
                                            version: extract.version(line),
                                            description: extract.description(line)
                                        });
                                        break;
                                    case 'link':
                                        _.extend(tempModule, {
                                            link: extract.last(line)
                                        });
                                        break;
                                    case 'define':
                                        _.extend(tempModule, {
                                            define: extract.last(line)
                                        });
                                        break;
                                    case 'function':
                                    case 'event':
                                        if (!tempModule[tag + 's']) {
                                            tempModule[tag + 's'] = [];
                                        }
                                        tempModule[tag + 's'].push({
                                            name: extract.name(line),
                                            description: extract.description(line)
                                        });
                                }
                            });
                        }

                        // make sure module has a define property
                        if (!tempModule.define) {
                            tempModule.define = define.slice(-3) === '.js' ? define.slice(0, -3) : define;
                        }

                        _.extend(module, tempModule);
                    });

                    // make sure root types are defined
                    if (!output[directories[0]]) {
                        output[directories[0]] = [];
                    }

                    // check to see if parent module exhists already
                    parent = _.find(output[directories[0]], function (parent) {
                        return parent.name === directories[1];
                    });

                    if (directories.length === 2) {
                        if (!parent) {
                            output[directories[0]].push(module);
                        } else {
                            _.extend(parent, module);
                        }
                    } else {
                        if (!parent) {
                            parent = {
                                name: directories[1]
                            };
                            newParent = true;
                        }

                        if (!parent[directories[2]]) {
                            parent[directories[2]] = [];
                        }

                        parent[directories[2]].push(module);

                        if (newParent) {
                            output[directories[0]].push(parent);
                        }
                    }
                }
            });

            // format json for writing
            output = options.pretty ? JSON.stringify(output, null, 4) : JSON.stringify(output);

            grunt.file.write(file.dest, output);

            grunt.log.writeln().ok(file.dest + ' created.');
        });

    });

};
