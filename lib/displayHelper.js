#!/usr/bin / env node
'use strict';

var colors = require('colors');

var display = {
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

module.exports={
    'display': display
};