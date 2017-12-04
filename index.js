#!/usr/bin / env node

'use strict';

// libs init

var program = require('commander');
var colors = require('colors');
var Q = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
var Jimp = require('jimp');
var _ = require('lodash');
var Gauge = require("gauge");

// helpers

var display = {
    info: (str) => {
        console.log(str);
    },
    success: (str) => {
        str = ' ' + 'V'.green + ' ' + str;
        console.log(str);
    },
    error: (str) => {
        str = ' ' + 'X'.red + ' ' + str;
        console.log(str);
    },
    header: (str) => {
        console.log('');
        console.log(str);
    }
};

// app main variables and constants

const PLATFORMS = {
    'android': {
        definitions: ['./platforms/icons/android', './platforms/splash/android']
    },
    'ios': {
        definitions: ['./platforms/icons/ios', './platforms/splash/ios']
    },
    'windows': {
        definitions: ['./platforms/icons/windows', './platforms/splash/windows']
    },
    'blackberry10': {
        definitions: ['./platforms/icons/blackberry10']
    }
};
var g_imageObjects;
var g_selectedPlatforms = [];

// app functions

function check(settings) {
    display.header('Checking files and directories');

    return checkPlatforms(settings)
        .then((selPlatforms) => g_selectedPlatforms = selPlatforms)
        .then(() => getImages(settings))
        .then((iobjs) => {
            g_imageObjects = iobjs;
        })
        .then(() => checkOutPutDir(settings));

}

function checkPlatforms(settings) {
    var platformsKeys = _.keys(PLATFORMS);

    if (!settings.platforms || !Array.isArray(settings.platforms)) {
        display.success('Processing files for all platforms');
        return Q.resolve(platformsKeys);
    }

    var platforms = settings.platforms;
    var platformsToProcess = [];
    var platformsUnknown = [];

    platforms.forEach(platform => {

        if (_.find(platformsKeys, (p) => platform === p)) {
            platformsToProcess.push(platform);
        } else {
            platformsUnknown.push(platform);
        }
    });

    if (platformsUnknown.length > 0) {
        display.error('Bad platforms: ' + platformsUnknown);
        return Q.reject('Bad platforms: ' + platformsUnknown);
    }

    display.success('Processing files for: ' + platformsToProcess);
    return Q.resolve(platformsToProcess);
}

function getImages(settings) {

    var imageObjects = {
        icon: null,
        splash: null
    };

    var promise = Q.resolve();

    if (settings.makeicon) {
        promise = promise.then(() => checkIconFile(settings.iconfile))
            .then((image) => {
                imageObjects.icon = image;
            });
    }
    if (settings.makesplash) {
        promise = promise.then(() => checkSplashFile(settings.splashfile))
            .then((image) => {
                imageObjects.splash = image;
            });
    }

    return promise.then(() => {
        return imageObjects;
    });

    function checkIconFile(iconFileName) {
        var defer = Q.defer();

        Jimp.read(iconFileName)
            .then((image) => {
                var width = image.bitmap.width;
                var height = image.bitmap.height;
                if (width === 1024 && width === height) {
                    display.success('Icon file ok (' + width + 'x' + height + ')');
                    defer.resolve(image);
                } else {
                    display.error('Bad icon file (' + width + 'x' + height + ')');
                    defer.reject('Bad image format');
                }
            })
            .catch((err) => {
                display.error('Could not load icon file');
                defer.reject(err);
            });

        return defer.promise;
    }

    function checkSplashFile(splashFileName) {
        var defer = Q.defer();

        Jimp.read(splashFileName)
            .then((image) => {
                var width = image.bitmap.width;
                var height = image.bitmap.height;
                if (width === 2732 && width === height) {
                    display.success('Splash file ok (' + width + 'x' + height + ')');
                    defer.resolve(image);
                } else {
                    display.error('Bad splash file (' + width + 'x' + height + ')');
                    defer.reject('Bad image format');
                }
            })
            .catch((err) => {
                display.error('Could not load splash file');
                defer.reject(err);
            });

        return defer.promise;
    }

}

function checkOutPutDir(settings) {
    var dir = settings.outputdirectory;

    return fs.pathExists(dir)
        .then((exists) => {
            if (exists) {
                display.success('Output directory ok (' + dir + ')');
            } else {
                display.error('Output directory not found (' + dir + ')');
                throw ('Output directory not found: ' + dir);
            }
        });

}

function generateForConfig(imageObj, settings, config) {
    var platformPath = path.join(settings.outputdirectory, config.path);

    var transformIcon = (definition) => {
        var defer = Q.defer();
        var image = imageObj.icon.clone();

        var outputFilePath = path.join(platformPath, definition.name);

        image.resize(definition.size, definition.size)
            .write(outputFilePath,
                (err) => {
                    if (err) defer.reject(err);
                    //display.info('Generated icon file for ' + outputFilePath);
                    defer.resolve();
                });

        return defer.promise;
    };

    var transformSplash = (definition) => {
        var defer = Q.defer();
        var image = imageObj.splash.clone();

        var x = (image.bitmap.width - definition.width) / 2;
        var y = (image.bitmap.height - definition.height) / 2;
        var width = definition.width;
        var height = definition.height;

        var outputFilePath = path.join(platformPath, definition.name);

        image
            .crop(x, y, width, height)
            .write(outputFilePath,
                (err) => {
                    if (err) defer.reject(err);
                    //display.info('Generated splash file for ' + outputFilePath);
                    defer.resolve();
                });

        return defer.promise;
    };

    return fs.ensureDir(platformPath)
        .then(() => {

            var definitions = config.definitions;
            var sectionName = "Generating " + config.type + ' files for ' + config.platform;
            var definitionCount = definitions.length;
            var progressIndex = 0;

            var gauge = new Gauge();
            gauge.show(sectionName, 0);

            return Q.mapSeries(definitions, (def) => {
                var transformPromise = Q.resolve();
                transformPromise = transformPromise.then(() => {
                    progressIndex++;
                    var progressRate = progressIndex / definitionCount;
                    gauge.show(sectionName, progressRate);
                    gauge.pulse(def.name);
                });
                switch (config.type) {
                    case 'icon':
                        transformPromise = transformPromise.then(() => transformIcon(def));
                        break;
                    case 'splash':
                        transformPromise = transformPromise.then(() => transformSplash(def));
                        break;
                }
                return transformPromise;
            }).then(() => {
                gauge.disable();
                display.success('Generated ' + config.type + ' files for ' + config.platform);
            }).catch((err) => {
                gauge.disable();
                throw (err);
            });

        });
}

function generate(imageObj, settings) {

    display.header('Generating files');

    var configs = [];

    g_selectedPlatforms.forEach((platform) => {
        PLATFORMS[platform].definitions.forEach((def) => configs.push(require(def)));
    });

    var filteredConfigs = _.filter(configs, (config) => {
        if (config.type === 'icon' && settings.makeicon) return true;
        if (config.type === 'splash' && settings.makesplash) return true;
        return false;
    });

    return Q.mapSeries(filteredConfigs, (config) => {
            return generateForConfig(imageObj, settings, config);
        })
        .then(() => {
            //display.success("Successfully generated all files");
        });

}

function catchErrors(err) {
    if (err)
        console.log('Error: ', err);
}

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

var g_settings = {
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

check(g_settings)
    .then(() => generate(g_imageObjects, g_settings))
    .catch((err) => catchErrors(err));