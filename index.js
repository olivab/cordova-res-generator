#!/usr/bin / env node
'use strict';

var program = require('commander');
var path = require('path');
var engine = require('./lib/engine');

// cli helper configuration

function processList(val) {
    return val.split(',');
}

var pjson = require('./package.json');
program
    .version(pjson.version)
    .description(pjson.description)
    .option('-i, --icon [optional]', 'optional icon file path (default: ./resources/icon.png)')
    .option('-s, --splash [optional]', 'optional splash file path (default: ./resources/splash.png)')
    .option('-p, --platforms [optional]', 'optional platform token comma separated list (default: all platforms processed)', processList)
    .option('-o, --outputdir [optional]', 'optional output directory (default: ./resources/)')
    .option('-I, --makeicon [optional]', 'option to process icon files only')
    .option('-S, --makesplash [optional]', 'option to process splash files only')
    .parse(process.argv);

// app settings and default values

var settings = {
    iconfile: program.icon || path.join('.', 'resources', 'icon.png'),
    splashfile: program.splash || path.join('.', 'resources', 'splash.png'),
    platforms: program.platforms || undefined,
    outputdirectory: program.outputdir || path.join('.', 'resources'),
    makeicon: program.makeicon || (!program.makeicon && !program.makesplash) ? true : false,
    makesplash: program.makesplash || (!program.makeicon && !program.makesplash) ? true : false
};

// app entry point

console.log("***************************");
console.log("cordova-res-generator " + pjson.version);
console.log("***************************");

engine.start(settings);