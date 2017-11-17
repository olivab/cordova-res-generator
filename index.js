#!/usr/bin/env node

'use strict';

// Lib definitions

var program = require('commander');
var colors = require('colors');

var _ = require('lodash');
var Q = require('q');

var fs = require('fs-extra');
var path = require('path');

var Jimp = require('jimp');

// helpers

var display = {
    info: (str) => {
        console.log('  ' + str);
    },
    success: (str) => {
        str = 'V'.green + '  ' + str;
        console.log('  ' + str);
    },
    error: (str) => {
        str = 'X'.red + '  ' + str;
        console.log('  ' + str);
    },
    header: (str) => {
        console.log('');
        console.log(str.cyan.underline);
    }
};

// app main variables

var imageObjects;

// app functions

function check(_settings) {
    display.header('Checking image files and output directory');

    return getImages(_settings)
        .then((iobjs) => {
            imageObjects = iobjs;
        })
        .then(() => checkOutPutDir(_settings));

}

function getImages(_settings) {

    var _imageObjects = {
        icon: null,
        splash: null
    };

    return checkIconFile(_settings.iconfile)
        .then((image) => {
            _imageObjects.icon = image;
        })
        .then(() => checkSplashFile(_settings.splashFileName))
        .then((image) => {
            _imageObjects.splash = image;
            return _imageObjects;
        });

    function checkIconFile(iconFileName) {
        var defer = Q.defer();

        Jimp.read(_settings.iconfile)
            .then((image) => {
                var width = image.bitmap.width;
                var height = image.bitmap.height;
                display.info('Icon: ' + width + 'x' + height);
                if (width === 1024 && width === height) {
                    display.success('Icon file ok.')
                    defer.resolve(image);
                } else {
                    display.error('Bad icon file.')
                    defer.reject('Bad image format.');
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

        Jimp.read(_settings.splashfile)
            .then((image) => {
                var width = image.bitmap.width;
                var height = image.bitmap.height;
                display.info('Splash: ' + width + 'x' + height);
                if (width === 2732 && width === height) {
                    display.success('Splash file ok.')
                    defer.resolve(image);
                } else {
                    display.error('Bad splash file.')
                    defer.reject('Bad image format.');
                }
            })
            .catch((err) => {
                display.error('Could not load splash file');
                defer.reject(err);
            });

        return defer.promise;
    }

}

function checkOutPutDir(_settings) {
    var dir = _settings.outputdirectory;

    display.info('Output directory: ' + dir);

    return fs.pathExists(dir)
        .then((exists) => {
            if (exists) {
                display.success('Output directory ok.');
            } else {
                display.error('Output directory not found.');
                throw ('Not found: ' + dir);
            }
        });

}

function generateForConfig(_imageObj, _settings, _config) {
    var platformPath = path.join(_settings.outputdirectory, _config.path);

    var transformIcon = (definition) => {
        var defer = Q.defer();
        var image = _imageObj.icon.clone();

        image.resize(definition.size, definition.size)
            .write(path.join(platformPath, definition.name));

        defer.resolve();

        return defer.promise;
    };

    var transformSplash = (definition) => {
        var defer = Q.defer();
        var image = _imageObj.splash.clone();

        var x = (image.bitmap.width - definition.width) / 2;
        var y = (image.bitmap.height - definition.height) / 2;
        var width = definition.width;
        var height = definition.height;

        image
            .crop(x, y, width, height)
            .write(path.join(platformPath, definition.name));

        defer.resolve();

        return defer.promise;
    };

    return fs.ensureDir(platformPath)
        .then(() => {
            var definitions = _config.definitions;
            var actions = [];
            definitions.forEach((def) => {
                switch (_config.type) {
                    case 'icon':
                        actions.push(transformIcon(def));
                        break;
                    case 'splash':
                        actions.push(transformSplash(def));
                        break;
                }
            });
            return Q.all(actions)
                .then(() => {
                    display.success('Generated ' + _config.type + ' files for ' + _config.platform);
                });
        });
}

function generate(_imageObj, _settings) {

    display.header('Generating files');

    var configs = [
        // android
        require('./platforms/icons/android'),
        require('./platforms/splash/android'),
        // ios
        require('./platforms/icons/ios'),
        require('./platforms/splash/ios'),
        // blackberry10
        require('./platforms/icons/blackberry10'),
    ];

    var actions = [];
    configs.forEach((config) => {
        actions.push(generateForConfig(_imageObj, _settings, config));
    });

    return Q.all(actions)
        .then(() => {
            //display.success("Successfully generated all files");
        });

}

function catchErrors(err) {
    if (err)
        console.log('Error: ', err);
}

// cli helper configuration

program
    .version('0.1.0')
    .description('Generates icon & splash screen for cordova/ionic projects using javascript only.')
    .option('-i, --icon [optional]', 'optional icon file path (default: resources/icon.png)')
    .option('-s, --splash [optional]', 'optional splash file path (default: resources/splash.png)')
    .option('-o, -outputdir [optional]', 'optional output directory (default: current directory, outputs to resources/)')
    .parse(process.argv);

// app settings and default values

var settings = {
    iconfile: program.icon || path.join('.', 'resources', 'icon.png'),
    splashfile: program.splash || path.join('.', 'resources', 'splash.png'),
    outputdirectory: program.outputdir || path.join('.', 'resources')
};

// app entry point

check(settings)
    .then(() => generate(imageObjects, settings))
    .catch((err) => catchErrors(err));