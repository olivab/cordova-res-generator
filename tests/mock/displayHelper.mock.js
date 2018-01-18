var sinon = require('sinon');
var displayHelper = require('../../lib/system/displayHelper');

function DisplayStub() {}
DisplayStub.prototype.stubs = {};
DisplayStub.prototype.stub = function () {
    this.stubs = {
        'info': sinon.stub(displayHelper, 'info'),
        'success': sinon.stub(displayHelper, 'success'),
        'error': sinon.stub(displayHelper, 'error'),
        'header': sinon.stub(displayHelper, 'header')
    };
};
DisplayStub.prototype.restore = function () {
    this.stubs.info.restore();
    this.stubs.success.restore();
    this.stubs.error.restore();
    this.stubs.header.restore();
};

module.exports = {
    'DisplayStub': DisplayStub
};