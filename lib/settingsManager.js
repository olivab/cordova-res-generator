var program = require('commander');
var path = require('path');

// cli helper configuration

function processList(val) {
    return val.split(',');
}

function getCommand(commandLineArguments) {
    var pjson = require('../package.json');
    program
        .version(pjson.version)
        .description(pjson.description)
        .option('-i, --icon [optional]', 'optional icon file path (default: ./resources/icon.png)')
        .option('-s, --splash [optional]', 'optional splash file path (default: ./resources/splash.png)')
        .option('-p, --platforms [optional]', 'optional platform token comma separated list (default: all platforms processed)', processList)
        .option('-o, --outputdir [optional]', 'optional output directory (default: ./resources/)')
        .option('-I, --makeicon [optional]', 'option to process icon files only')
        .option('-S, --makesplash [optional]', 'option to process splash files only')
        .parse(commandLineArguments);
    return {
        version: pjson.version,
        icon: program.icon,
        splash: program.splash,
        outputdir: program.outputdir,
        makeicon: program.makeicon,
        makesplash: program.makesplash
    };
}

function computeSettings(command) {
    // app settings and default values
    var settings = {
        iconfile: command.icon || path.join('.', 'resources', 'icon.png'),
        splashfile: command.splash || path.join('.', 'resources', 'splash.png'),
        platforms: command.platforms || undefined,
        outputdirectory: command.outputdir || path.join('.', 'resources'),
        makeicon: command.makeicon || (!command.makeicon && !command.makesplash) ? true : false,
        makesplash: command.makesplash || (!command.makeicon && !command.makesplash) ? true : false
    };
    return settings;
}

function makeSettings(commandLineArguments) {
    var command = getCommand(commandLineArguments);
    return computeSettings(command);
}

module.exports = {
    'getCommand': getCommand,
    'computeSettings': computeSettings,
    'makeSettings': makeSettings
};