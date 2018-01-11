#!/usr/bin / env node

'use strict';

// libs init
var Q = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
var Jimp = require('jimp');
var Gauge = require("gauge");
var displayHelper = require('./displayHelper');

// helpers

var display = displayHelper.display;

// module functions

function transformIcon(imageObjects, outputPath, definition) {
    var defer = Q.defer();
    var image = imageObjects.icon.clone();

    var outputFilePath = path.join(outputPath, definition.name);

    image.resize(definition.size, definition.size)
        .write(outputFilePath,
            (err) => {
                if (err) defer.reject(err);
                //display.info('Generated icon file for ' + outputFilePath);
                defer.resolve();
            });

    return defer.promise;
}

function transformSplash(imageObjects, outputPath, definition) {
    var defer = Q.defer();
    var image = imageObjects.splash.clone();

    var x = (image.bitmap.width - definition.width) / 2;
    var y = (image.bitmap.height - definition.height) / 2;
    var width = definition.width;
    var height = definition.height;

    var outputFilePath = path.join(outputPath, definition.name);

    image
        .crop(x, y, width, height)
        .write(outputFilePath,
            (err) => {
                if (err) defer.reject(err);
                //display.info('Generated splash file for ' + outputFilePath);
                defer.resolve();
            });

    return defer.promise;
}

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
                        transformPromise = transformPromise.then(() => transformIcon(imageObjects, outputPath, def));
                        break;
                    case 'splash':
                        transformPromise = transformPromise.then(() => transformSplash(imageObjects, outputPath, def));
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