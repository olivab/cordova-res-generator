#!/usr/bin / env node
'use strict';

// libs init
var errorHandler = require('./errorHandler');
var checker = require('./checker');
var generator = require('./generator');

// module functions

function start(settings) {
    return checker.check(settings)
        .then((config) => generator.generate(settings, config))
        .catch((err) => errorHandler.catchErrors(err));
}

// module exports

module.exports = {
    'start': start
};