#!/usr/bin / env node
'use strict';

// internal libs init

var display = require('../system/displayHelper');

// module functions

function catchErrors(err) {
    if (err)
        display.error(err);
}

// module exports

module.exports = {
    'catchErrors': catchErrors
};