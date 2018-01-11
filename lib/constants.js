#!/usr/bin / env node
'use strict';

const PLATFORMS = {
    'android': {
        definitions: ['../platforms/icons/android', '../platforms/splash/android']
    },
    'ios': {
        definitions: ['../platforms/icons/ios', '../platforms/splash/ios']
    },
    'windows': {
        definitions: ['../platforms/icons/windows', '../platforms/splash/windows']
    },
    'blackberry10': {
        definitions: ['../platforms/icons/blackberry10']
    }
};

module.exports={
    'PLATFORMS': PLATFORMS
};