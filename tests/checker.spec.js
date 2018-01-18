var Q = require('bluebird');
var assert = require('assert');
var sinon = require('sinon');

// tested module
var checker = require('../lib/checker');

// mocks
var displayMock = require('./mock/displayMock');

// injected modules
var imageManager = require('../lib/core/imageManager');
var platformManager = require('../lib/core/platformManager');
var fsManager = require('../lib/system/fsManager');

describe('Checker', function () {

    describe('Calls', function () {
        var displayStub,
            fsManagerStub, imageManagerStub,
            platformManagerCheckStub, platformManagerGetSelectedStub;

        beforeEach(function () {
            displayStub = new displayMock.DisplayStub();
            displayStub.stub();
            fsManagerStub = sinon.stub(fsManager, 'checkOutPutDir')
                .returns(Q.resolve());
            imageManagerStub = sinon.stub(imageManager, 'getImages')
                .returns(Q.resolve());
            platformManagerCheckStub = sinon.stub(platformManager, 'checkPlatforms')
                .returns(Q.resolve());
            platformManagerGetSelectedStub = sinon.stub(platformManager, 'getSelectedImagePlatformDefinitions')
                .returns(Q.resolve());
        });

        afterEach(function () {
            displayStub.restore();
            fsManagerStub.restore();
            imageManagerStub.restore();
            platformManagerCheckStub.restore();
            platformManagerGetSelectedStub.restore();
        });

        it('should call platformManager.checkPlatforms', function (done) {
            checker.check()
                .then(() => {
                    assert(platformManagerCheckStub.called);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should call imageManager.getImages', function (done) {
            checker.check()
                .then(() => {
                    assert(imageManagerStub.called);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should call fsManager.checkOutPutDir', function (done) {
            checker.check()
                .then(() => {
                    assert(fsManagerStub.called);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should call platformManager.getSelectedImagePlatformDefinitions', function (done) {
            checker.check()
                .then(() => {
                    assert(platformManagerGetSelectedStub.called);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });


    describe('Process', function () {
        var displayStub,
            fsManagerStub, imageManagerStub,
            platformManagerCheckStub, platformManagerGetSelectedStub;

        beforeEach(function () {
            displayStub = new displayMock.DisplayStub();
            displayStub.stub();
            fsManagerStub = sinon.stub(fsManager, 'checkOutPutDir')
                .callsFake(() => Q.resolve());
            imageManagerStub = sinon.stub(imageManager, 'getImages')
                .callsFake(() => Q.resolve({
                    'icon': 'iconImages',
                    'splash': 'splashImages'
                }));
            platformManagerCheckStub = sinon.stub(platformManager, 'checkPlatforms')
                .callsFake(() => Q.resolve());
            platformManagerGetSelectedStub = sinon.stub(platformManager, 'getSelectedImagePlatformDefinitions')
                .callsFake(() => Q.resolve([{}]));
        });

        afterEach(function () {
            displayStub.restore();
            fsManagerStub.restore();
            imageManagerStub.restore();
            platformManagerCheckStub.restore();
            platformManagerGetSelectedStub.restore();
        });


        it('should populate and return a config object', function (done) {
            checker.check({})
                .then((config) => {
                    assert.notEqual(config, 'undefined');
                    assert.notEqual(config.imageObjects, 'undefined');
                    assert.equal(config.imageObjects.icon, 'iconImages');
                    assert.equal(config.imageObjects.splash, 'splashImages');
                    assert.notEqual(config.selectedImagePlatformDefinitions, 'undefined');
                    assert.equal(config.selectedImagePlatformDefinitions.length, 1);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

    });



});