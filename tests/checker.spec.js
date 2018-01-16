var Q = require('bluebird');
var assert = require('assert');
var sinon = require('sinon');

var checker = require('../lib/checker');
var display = require('../lib/system/displayHelper');

describe('Checker', function () {
    beforeEach(function () {
        displayStub = sinon.stub(display, 'info');
    });

    afterEach(function () {
        displayStub.restore();
    });


});