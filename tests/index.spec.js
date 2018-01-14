var Q = require('bluebird');
var assert = require('assert');
var sinon = require('sinon');

var appBootstrap = require('../index');
var settingsManager = require('../lib/settingsManager');
var engine = require('../lib/engine');

describe('Index', function () {
    var makeSettingsStub,
        engineStartStub;

    beforeEach(function () {
        makeSettingsStub = sinon.stub(settingsManager, 'makeSettings').returns({});
        engineStartStub = sinon.stub(engine, "start").returns(Q.resolve());
    });

    afterEach(function () {
        makeSettingsStub.restore();
        engineStartStub.restore();
    });

    it('should call engine start function', function (done) {
        appBootstrap.start()
            .then(() => {
                assert(engineStartStub.called);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

});