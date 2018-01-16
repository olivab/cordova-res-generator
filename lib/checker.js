#!/usr/bin / env node
'use strict';

// internal libs init

var display = require('./system/displayHelper');
var imageManager = require('./core/imageManager');
var platformManager = require('./core/platformManager');
var fsManager = require('./system/fsManager');

// module functions

function check(settings) {
    display.header('Checking files and directories');

    var selectedPlatforms = [];
    var imageObjects;

    return platformManager.checkPlatforms(settings)
        .then((selPlatforms) => selectedPlatforms = selPlatforms)
        .then(() => imageManager.getImages(settings))
        .then((imageObjs) => {
            imageObjects = imageObjs;
        })
        .then(() => fsManager.checkOutPutDir(settings))
        .then(() => platformManager.getSelectedImagePlatformDefinitions(settings, selectedPlatforms))
        .then((selectedImagePlatformDefinitions) => {
            return {
                'imageObjects': imageObjects,
                'selectedImagePlatformDefinitions': selectedImagePlatformDefinitions
            };
        });
}

// module exports

module.exports = {
    'check': check
};