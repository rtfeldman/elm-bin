#!/usr/bin/env node
'use strict';

var filename = require.resolve("../dist/elm");
var spawn = require("child_process").spawn;
var input = process.argv.slice(2);

spawn(filename, input, {stdio: 'inherit'})
    .on('exit', process.exit);
