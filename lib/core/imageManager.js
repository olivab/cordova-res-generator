#!/usr/bin / env node
'use strict';

// external libs init

var Q = require('bluebird');
var Jimp = require('jimp');
var path = require('path');

// internal libs init

var display = require('../system/displayHelper');

// private module functions

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

// public module functions

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
}


function transformIcon(imageObjects, outputPath, definition) {
    var defer = Q.defer();
    var image = imageObjects.icon.clone();

    var outputFilePath = path.join(outputPath, definition.name);

    image.resize(definition.size, definition.size)
        .write(outputFilePath,
            (err) => {
                if (err) defer.reject(err);
                //display.info('Generated icon file for ' + outputFilePath);
                defer.resolve();
            });

    return defer.promise;
}

function transformSplash(imageObjects, outputPath, definition, resize) {
    var defer = Q.defer();
    var image = imageObjects.splash.clone();

    if (resize) {
        // first resize the provided source image down to match the maximum dimention of the current target output
        var maxDimension = definition.width > definition.height ? definition.width : definition.height;
        image.resize(maxDimension, maxDimension);
    }

    var x = (image.bitmap.width - definition.width) / 2;
    var y = (image.bitmap.height - definition.height) / 2;
    var width = definition.width;
    var height = definition.height;

    var outputFilePath = path.join(outputPath, definition.name);

    image
        .crop(x, y, width, height)
        .write(outputFilePath,
            (err) => {
                if (err) defer.reject(err);
                //display.info('Generated splash file for ' + outputFilePath);
                defer.resolve();
            });

    return defer.promise;
}


// module exports

module.exports = {
    'getImages': getImages,
    'transformIcon':transformIcon,
    'transformSplash':transformSplash
};