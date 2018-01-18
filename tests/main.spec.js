var Q = require('bluebird');
var assert = require('assert');
var sinon = require('sinon');

// tested module
var main = require('../lib/main');

// mocks
var displayMock = require('./mock/displayMock');

// injected modules
var checker = require('../lib/checker');
var errorHandler = require('../lib/core/errorHandler');
var generator = require('../lib/generator');
var settingsManager = require('../lib/core/settingsManager');

describe('Main', function () {
    var checkerCheckStub,
        displayStub,
        generatorGenerateStub,
        errorHandlerStub,
        makeSettingsStub;

    beforeEach(function () {
        displayStub = new displayMock.DisplayStub();
        displayStub.stub();
        checkerCheckStub = sinon.stub(checker, 'check').returns(Q.resolve());
        generatorGenerateStub = sinon.stub(generator, 'generate').returns(Q.resolve());
        errorHandlerStub = sinon.stub(errorHandler, 'catchErrors').returns(Q.resolve());
        makeSettingsStub = sinon.stub(settingsManager, 'makeSettings').returns({});
    });

    afterEach(function () {
        displayStub.restore();
        checkerCheckStub.restore();
        generatorGenerateStub.restore();
        errorHandlerStub.restore();
        makeSettingsStub.restore();
    });

    it('should call checker.check', function (done) {
        main.start()
            .then(() => {
                assert(checkerCheckStub.called);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('should call generator.generate', function (done) {
        main.start()
            .then(() => {
                assert(generatorGenerateStub.called);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('should not call errorHandler.catchErrors when no error', function (done) {
        main.start()
            .then(() => {
                assert(errorHandlerStub.notCalled);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

});