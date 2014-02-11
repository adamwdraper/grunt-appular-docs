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
        _ = require('underscore'),
        ifNotInDefine = function (object, property, value) {
            if (property in object) {
                object[property] = value || {};
            }
        };

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
                    return line.match(/^@([\w]+)/i)[1];
                },
                name: function (line) {
                    return line.split(' ')[1];
                },
                version: function (line) {
                    var version = line.match(/v[\d\.]+/i);
                    
                    return version ? version[0] : '';
                },
                description: function(line) {
                    var description = line.match(/ - (.+)/i);
                    
                    return description ? description[1] : '';
                },
                last: function (line) {
                    var last = line.match(/[^\s]+$/i);

                    return last ? last[0] : '';
                },
                param: function (line, tag) {
                    var param = {},
                        name = extract.name(line),
                        isOptional = false;

                    if (name.indexOf('[') !== -1) {
                        name = name.slice(1, -1);
                        isOptional = true;
                    }

                    param = {
                        name: name.split(':')[0],
                        type: name.split(':')[1],
                        description: extract.description(line)
                    };

                    if (tag === 'param') {
                        param.isOptional = isOptional;
                    }

                    return param;
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
                    module = {};

                if (data.indexOf('@appular') !== -1) {
                    // docs found
                    grunt.log.writeln(define);

                    // gets all multi line comments in file
                    comments = data.match(/\/\*+([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//gm);

                    comments.forEach(function(comment) {
                        var doc = {
                            // extracts all lines with a tag
                            lines: comment.match(/(@.*[^\r\n])/g),
                            data: {
                                path: define
                            },
                            type: {}
                        };
                        
                        if (doc.lines) {
                            doc.lines.forEach(function(line) {
                                var tag,
                                    param;

                                line.trim();

                                tag = extract.tag(line);

                                // doc type for definition tags
                                switch (tag) {
                                    case 'appular':
                                    case 'function':
                                    case 'event':
                                        doc.type = tag;
                                        break;
                                }

                                switch (tag) {
                                    case 'appular':
                                        _.extend(doc.data, {
                                            name: extract.name(line),
                                            version: extract.version(line),
                                            description: extract.description(line)
                                        });
                                        break;
                                    case 'link':
                                        _.extend(doc.data, {
                                            link: extract.last(line)
                                        });
                                        break;
                                    case 'define':
                                        _.extend(doc.data, {
                                            define: extract.last(line)
                                        });
                                        break;
                                    case 'function':
                                    case 'event':
                                        _.extend(doc.data, {
                                            name: extract.name(line),
                                            description: extract.description(line)
                                        });
                                        break;
                                    case 'param':
                                    case 'return':
                                        if (!doc.data[tag + 's']) {
                                            doc.data[tag + 's'] = [];
                                        }

                                        doc.data[tag + 's'].push(extract.param(line, tag));
                                        break;
                                }
                            });

                            // add doc data to module
                            switch (doc.type) {
                                case 'appular':
                                    // make sure module has a define property
                                    if (!doc.data.define) {
                                        doc.data.define = define.slice(-3) === '.js' ? define.slice(0, -3) : define;
                                    }
                                    // add doc data to module base
                                    _.extend(module, doc.data);
                                    break;
                                case 'function':
                                case 'event':
                                    module[doc.type + 's'] = module[doc.type + 's'] || [];
                                    module[doc.type + 's'].push(doc.data);
                                    break;
                            }                            
                        }
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

                        if (!parent.extras) {
                            parent.extras = {};
                        }

                        if (!parent.extras[directories[2]]) {
                            parent.extras[directories[2]] = [];
                        }

                        parent.extras[directories[2]].push(module);

                        if (newParent) {
                            output[directories[0]].push(parent);
                        }
                    }
                }
            });

            // format json for writing
            output = 'define(' + (options.pretty ? JSON.stringify(output, null, 4) : JSON.stringify(output)) + ');';

            grunt.file.write(file.dest, output);

            grunt.log.writeln().ok(file.dest + ' created.');
        });

    });

};
