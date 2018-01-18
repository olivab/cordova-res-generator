var Q = require('bluebird');
var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

// tested module
var sut = rewire('../lib/generator.js');

// mocks
var displayMock = require('./mock/displayHelper.mock');

// modules
var fs = require('fs-extra');
var Gauge = require("gauge");


describe('Generator', function () {
    var displayStub;
    var generateForImagePlatformDefinitionSpy, generateForImagePlatformDefinitionRewire;

    beforeEach(function () {
        displayStub = new displayMock.DisplayStub();
        displayStub.stub();
        generateForImagePlatformDefinitionSpy = sinon.spy();
        generateForImagePlatformDefinitionRewire = sut.__set__("generateForImagePlatformDefinition", generateForImagePlatformDefinitionSpy);
    });
    afterEach(function () {
        displayStub.restore();
        generateForImagePlatformDefinitionRewire();
    });

    it('should call generateForImagePlatformDefinition', function (done) {
        var settings = {};
        var config = {
            'selectedImagePlatformDefinitions': [{}, {}]
        };
        sut.generate(settings, config)
            .then(() => {
                assert(generateForImagePlatformDefinitionSpy.calledTwice);
                done();
            })
            .catch((err) => done(err));

    });



});