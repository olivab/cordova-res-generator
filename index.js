#!/usr/bin / env node
'use strict';

var display = require('./lib/displayHelper');
var settingsManager = require('./lib/settingsManager');
var engine = require('./lib/engine');

// module function

function start() {
    var settings = settingsManager.makeSettings(process.argv);

    display.info("***************************");
    display.info("cordova-res-generator " + settings.version);
    display.info("***************************");

    return engine.start(settings);
}

module.exports = {
    "start": start
};