#!/usr/bin / env node

'use strict';

// external libs init

var Q = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
var Jimp = require('jimp');
var Gauge = require("gauge");

// internal libs init

var display = require('./system/displayHelper');
var imageManager = require('./core/imageManager');


// private module functions

function generateForImagePlatformDefinition(settings, imageObjects, imagePlatformDefinition) {
    var outputPath = path.join(settings.outputdirectory, imagePlatformDefinition.path);

    return fs.ensureDir(outputPath)
        .then(() => {

            var definitions = imagePlatformDefinition.definitions;
            var sectionName = "Generating " + imagePlatformDefinition.type + ' files for ' + imagePlatformDefinition.platform;
            var definitionCount = definitions.length;
            var progressIndex = 0;

            var gauge = new Gauge();
            gauge.show(sectionName, 0);

            return Q.mapSeries(definitions, (def) => {
                var transformPromise = Q.resolve();
                transformPromise = transformPromise.then(() => {
                    progressIndex++;
                    var progressRate = progressIndex / definitionCount;
                    gauge.show(sectionName, progressRate);
                    gauge.pulse(def.name);
                });
                switch (imagePlatformDefinition.type) {
                    case 'icon':
                        transformPromise = transformPromise.then(() => imageManager.transformIcon(imageObjects, outputPath, def));
                        break;
                    case 'splash':
                        transformPromise = transformPromise.then(() => imageManager.transformSplash(imageObjects, outputPath, def, settings.resize));
                        break;
                }
                return transformPromise;
            }).then(() => {
                gauge.disable();
                display.success('Generated ' + imagePlatformDefinition.type + ' files for ' + imagePlatformDefinition.platform);
            }).catch((err) => {
                gauge.disable();
                throw (err);
            });

        });
}

// public module functions

function generate(settings, config) {

    display.header('Generating files');

    var imagePlatformDefinitions = config.selectedImagePlatformDefinitions;

    return Q.mapSeries(imagePlatformDefinitions, (imagePlatformDef) => {
        return generateForImagePlatformDefinition(settings, config.imageObjects, imagePlatformDef);
    });

}

// module exports

module.exports = {
    'generate': generate
};