#!/usr/bin / env node
'use strict';

// module functions

function catchErrors(err) {
    if (err)
        console.log('Error: ', err);
}

// module exports

module.exports={
    'catchErrors': catchErrors
};