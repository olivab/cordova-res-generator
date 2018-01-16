#!/usr/bin / env node
'use strict';

// external libs init

var Q = require('bluebird');
var Jimp = require('jimp');

// internal libs init

var display = require('../system/displayHelper');

// module functions

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

// module exports

module.exports = {
    'getImages': getImages
};