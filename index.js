#!/usr/bin / env node
'use strict';

var settingsManager = require('./lib/settingsManager');
var engine = require('./lib/engine');

// module function

function start() {
    var settings = settingsManager.makeSettings(process.argv);

    console.log("***************************");
    console.log("cordova-res-generator " + settings.version);
    console.log("***************************");

    return engine.start(settings);
}

module.exports = {
    "start": start
};