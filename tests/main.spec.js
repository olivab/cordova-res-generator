var Q = require('bluebird');
var assert = require('assert');
var sinon = require('sinon');

var main = require('../lib/main');

var checker = require('../lib/checker');
var display = require('../lib/system/displayHelper');
var errorHandler = require('../lib/core/errorHandler');
var generator = require('../lib/generator');
var settingsManager = require('../lib/core/settingsManager');

describe('Index', function () {
    var checkerCheckStub,
        displayInfoStub, displayErrorStub,
        generatorGenerateStub,
        errorHandlerStub,
        makeSettingsStub;

    beforeEach(function () {
        checkerCheckStub = sinon.stub(checker, 'check').returns(Q.resolve());
        displayInfoStub = sinon.stub(display, 'info');
        displayErrorStub = sinon.stub(display, 'error');
        generatorGenerateStub = sinon.stub(generator, 'generate').returns(Q.resolve());
        errorHandlerStub = sinon.stub(errorHandler, 'catchErrors').returns(Q.resolve());
        makeSettingsStub = sinon.stub(settingsManager, 'makeSettings').returns({});
    });

    afterEach(function () {
        checkerCheckStub.restore();
        displayInfoStub.restore();
        displayErrorStub.restore();
        generatorGenerateStub.restore();
        errorHandlerStub.restore();
        makeSettingsStub.restore();
    });

    it('should call checker check function', function (done) {
        main.start()
            .then(() => {
                assert(checkerCheckStub.called);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('should call generator generate function', function (done) {
        main.start()
            .then(() => {
                assert(generatorGenerateStub.called);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('should not call error handling function', function (done) {
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