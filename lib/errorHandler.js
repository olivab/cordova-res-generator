#!/usr/bin / env node

'use strict';

var display = require('./displayHelper');

// module functions

function catchErrors(err) {
    if (err)
        display.info('Error: ', err);
}

// module exports

module.exports = {
    'catchErrors': catchErrors
};