#!/usr/bin / env node
'use strict';

// internal libs init

var colors = require('colors');

// module exports

module.exports = {
    info: (str) => {
        console.log(str);
    },
    success: (str) => {
        str = ' ' + 'V'.green + ' ' + str;
        console.log(str);
    },
    error: (str) => {
        str = ' ' + 'X'.red + ' ' + str;
        console.log(str);
    },
    header: (str) => {
        console.log('');
        console.log(str);
    }
};