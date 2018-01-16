#!/usr/bin / env node
'use strict';

// internal libs init

var checker = require('./checker');
var display = require('./system/displayHelper');
var errorHandler = require('./core/errorHandler');
var generator = require('./generator');
var settingsManager = require('./core/settingsManager');

// module functions

function start() {
    var settings = settingsManager.makeSettings(process.argv);

    display.info("***************************");
    display.info("cordova-res-generator " + settings.version);
    display.info("***************************");

    return checker.check(settings)
        .then((config) => generator.generate(settings, config))
        .catch((err) => errorHandler.catchErrors(err));
}

// module exports

module.exports = {
    'start': start
};