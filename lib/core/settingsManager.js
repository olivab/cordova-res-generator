#!/usr/bin / env node
'use strict';

// external libs init

var program = require('commander');
var path = require('path');
var pjson = require('pjson');

// module functions

function processList(val) {
    return val.split(',');
}

function getCommand(commandLineArguments) {
    
    program
        .version(pjson.version)
        .description(pjson.description)
        .option('-i, --icon [optional]', 'optional icon file path (default: ./resources/icon.png)')
        .option('-s, --splash [optional]', 'optional splash file path (default: ./resources/splash.png)')
        .option('-p, --platforms [optional]', 'optional platform token comma separated list (default: all platforms processed)', processList)
        .option('-o, --outputdir [optional]', 'optional output directory (default: ./resources/)')
        .option('-I, --makeicon [optional]', 'option to process icon files only')
        .option('-S, --makesplash [optional]', 'option to process splash files only')
        .option('-R, --resize [optional]', 'option to resize splash source image before cropping')
        .parse(commandLineArguments);
    return {
        version: pjson.version,
        iconfile: program.icon || path.join('.', 'resources', 'icon.png'),
        splashfile: program.splash || path.join('.', 'resources', 'splash.png'),
        platforms: program.platforms,
        outputdirectory: program.outputdir || path.join('.', 'resources'),
        makeicon: program.makeicon || (!program.makeicon && !program.makesplash) ? true : false,
        makesplash: program.makesplash || (!program.makeicon && !program.makesplash) ? true : false,
        resize: program.resize
    };
}

function makeSettings(commandLineArguments) {
    return getCommand(commandLineArguments);
}

// module exports

module.exports = {
    'getCommand': getCommand,
    'computeSettings': computeSettings,
    'makeSettings': makeSettings
};