#!/usr/bin/env node

'use strict';

// libs init

var program = require('commander');
var colors = require('colors');
var Q = require('bluebird');
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

var g_imageObjects;

// app functions

function check(settings) {
    display.header('Checking files and directories');

    return getImages(settings)
        .then((iobjs) => {
            g_imageObjects = iobjs;
        })
        .then(() => checkOutPutDir(settings));

}

function getImages(settings) {

    var imageObjects = {
        icon: null,
        splash: null
    };

    return checkIconFile(settings.iconfile)
        .then((image) => {
            imageObjects.icon = image;
        })
        .then(() => checkSplashFile(settings.splashFileName))
        .then((image) => {
            imageObjects.splash = image;
            return imageObjects;
        });

    function checkIconFile(iconFileName) {
        var defer = Q.defer();

        Jimp.read(settings.iconfile)
            .then((image) => {
                var width = image.bitmap.width;
                var height = image.bitmap.height;
                if (width === 1024 && width === height) {
                    display.success('Icon file ok (' + width + 'x' + height + ')');
                    defer.resolve(image);
                } else {
                    display.error('Bad icon file (' + width + 'x' + height + ')');
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

        Jimp.read(settings.splashfile)
            .then((image) => {
                var width = image.bitmap.width;
                var height = image.bitmap.height;
                if (width === 2732 && width === height) {
                    display.success('Splash file ok (' + width + 'x' + height + ')');
                    defer.resolve(image);
                } else {
                    display.error('Bad splash file (' + width + 'x' + height + ')');
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

function checkOutPutDir(settings) {
    var dir = settings.outputdirectory;

    return fs.pathExists(dir)
        .then((exists) => {
            if (exists) {
                display.success('Output directory ok. (' + dir + ')');
            } else {
                display.error('Output directory not found. (' + dir + ')');
                throw ('Output directory Not found: ' + dir);
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
                    if (err) throw (err);
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
                    if (err) throw (err);
                    //display.info('Generated splash file for ' + outputFilePath);
                    defer.resolve();
                });

        return defer.promise;
    };

    return fs.ensureDir(platformPath)
        .then(() => {
            var definitions = config.definitions;

            return Q.mapSeries(definitions, (def) => {
                switch (config.type) {
                    case 'icon':
                        return transformIcon(def);
                    case 'splash':
                        return transformSplash(def);
                }
            }).then(() => {
                display.success('Generated ' + config.type + ' files for ' + config.platform);
            });

        });
}

function generate(imageObj, settings) {

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

    return Q.mapSeries(configs, (config) => {
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
var pjson = require('./package.json');
program
    .version(pjson.version)
    .description(pjson.description)
    .option('-i, --icon [optional]', 'optional icon file path (default: resources/icon.png)')
    .option('-s, --splash [optional]', 'optional splash file path (default: resources/splash.png)')
    .option('-o, -outputdir [optional]', 'optional output directory (default: current directory, outputs to \'resources\')')
    .parse(process.argv);

// app settings and default values

var g_settings = {
    iconfile: program.icon || path.join('.', 'resources', 'icon.png'),
    splashfile: program.splash || path.join('.', 'resources', 'splash.png'),
    outputdirectory: program.outputdir || path.join('.', 'resources')
};

// app entry point

check(g_settings)
    .then(() => generate(g_imageObjects, g_settings))
    .catch((err) => catchErrors(err));