#!/usr/bin / env node
'use strict';

// libs init
var Q = require('bluebird');
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var Jimp = require('jimp');
var displayHelper = require('./displayHelper');
var constants = require('./constants');

// helpers

var display = displayHelper.display;

// module variables and constants

const PLATFORMS = constants.PLATFORMS;

// module functions

function check(settings) {
    display.header('Checking files and directories');

    var selectedPlatforms = [];
    var imageObjects;

    return checkPlatforms(settings)
        .then((selPlatforms) => selectedPlatforms = selPlatforms)
        .then(() => getImages(settings))
        .then((iobjs) => {
            imageObjects = iobjs;
        })
        .then(() => checkOutPutDir(settings))
        .then(() => getSelectedImagePlatformDefinitions(settings, selectedPlatforms))
        .then((selectedImagePlatformDefinitions) => {
            return {
                'imageObjects': imageObjects,
                'selectedImagePlatformDefinitions': selectedImagePlatformDefinitions
            };
        });

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

function getSelectedImagePlatformDefinitions(settings, selectedPlatforms) {
    var imagePlatformDefinitions = [];

    selectedPlatforms.forEach((platform) => {
        PLATFORMS[platform].definitions.forEach((def) => imagePlatformDefinitions.push(require(def)));
    });

    var selectedImagePlatformDefinitions = _.filter(imagePlatformDefinitions, (imagePlatformDef) => {
        if (imagePlatformDef.type === 'icon' && settings.makeicon) return true;
        if (imagePlatformDef.type === 'splash' && settings.makesplash) return true;
        return false;
    });

    return Q.resolve(selectedImagePlatformDefinitions);
}

// module exports

module.exports = {
    'check': check
};