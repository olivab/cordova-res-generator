#!/usr/bin / env node
'use strict';

// external libs init

var fs = require('fs-extra');

// internal libs init

var display = require('./displayHelper');

// module functions

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

// module exports

module.exports = {
    'checkOutPutDir': checkOutPutDir
};
