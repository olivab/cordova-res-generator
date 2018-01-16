#!/usr/bin / env node
'use strict';

// external libs init

var Q = require('bluebird');
var _ = require('lodash');

// internal libs init

var display = require('../system/displayHelper');
var constants = require('./constants');

// module constants

const PLATFORMS = constants.PLATFORMS;

// module functions

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
    'checkPlatforms': checkPlatforms,
    'getSelectedImagePlatformDefinitions': getSelectedImagePlatformDefinitions
};