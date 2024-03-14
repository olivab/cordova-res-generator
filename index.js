#!/usr/bin / env node

'use strict';

// libs init

var program = require('commander');
var colors = require('colors');
var Q = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var Gauge = require("gauge");
var sharp = require('sharp');

const IMAGE_FORMATS = ['svg', 'webp', 'png', 'tif', 'tiff', 'dzi', 'szi', 'v', 'vips', 'jpg', 'jpeg'];

function isSupportedFormat(aFileName) {
  let vExt = path.extname(aFileName);
  if (vExt && vExt.length >= 2) {
    vExt = vExt.slice(1).toLowerCase();
    return IMAGE_FORMATS.indexOf(vExt) !== -1;
  }
}

// helpers

var display = {
    info: (str) => {
        console.log(str);
    },
    success: (str) => {
        str = ' ' + 'V'.green + ' ' + str;
        console.log(str);
    },
    error: (str) => {
        str = ' ' + 'X'.red + ' ' + str;
        console.log(str);
    },
    header: (str) => {
        console.log('');
        console.log(str);
    }
};

// app main variables and constants

const PLATFORMS = {
    'android': {
        definitions: ['./platforms/icons/android', './platforms/splash/android']
    },
    'ios': {
        definitions: ['./platforms/icons/ios', './platforms/splash/ios']
    },
    'windows': {
        definitions: ['./platforms/icons/windows', './platforms/splash/windows']
    },
    'blackberry10': {
        definitions: ['./platforms/icons/blackberry10']
    }
};
var g_imageObjects;
var g_selectedPlatforms = [];

// app functions

function getValidFileName(aFileName) {
  var result;
  var ext = path.extname(aFileName);
  if (ext.length > 1) {
    if (!isSupportedFormat(aFileName)) {
      throw new Error(aFileName + ' is not supported image format!');
    }
    if (fs.existsSync(path.resolve(aFileName))) result = aFileName;
  } else {
    if (ext.length === 1) aFileName = aFileName.slice(0, aFileName.length-2);
    for (let i = 0; i < IMAGE_FORMATS.length; i++) {
      if (fs.existsSync(path.resolve(aFileName+'.'+IMAGE_FORMATS[i]))) {
        result = aFileName+'.'+IMAGE_FORMATS[i];
        break;
      }
    }
  }
  if (!result) throw new Error(aFileName + ' no such file.');
  return result;
}

function check(settings) {
    display.header('Checking files and directories');

    var vFile;
    try {
      vFile = getValidFileName(settings.iconfile);
      settings.iconfile = vFile;

      vFile = getValidFileName(settings.splashfile);
      settings.splashfile = vFile;
    } catch(err) {
      catchErrors(err);
    }

    return checkPlatforms(settings)
        .then((selPlatforms) => g_selectedPlatforms = selPlatforms)
        .then(() => getImages(settings))
        .then((iobjs) => {
            g_imageObjects = iobjs;
        })
        .then(() => checkOutPutDir(settings));

}

function checkPlatforms(settings) {
    var platformsKeys = _.keys(PLATFORMS);

    if (!settings.platforms || !Array.isArray(settings.platforms)) {
        display.success('Processing files for all platforms');
        return Q.resolve(platformsKeys);
    }

    var platforms = settings.platforms;
    var platformsToProcess = [];
    var platformsUnknown = [];

    platforms.forEach(platform => {

        if (_.find(platformsKeys, (p) => platform === p)) {
            platformsToProcess.push(platform);
        } else {
            platformsUnknown.push(platform);
        }
    });

    if (platformsUnknown.length > 0) {
        display.error('Bad platforms: ' + platformsUnknown);
        return Q.reject('Bad platforms: ' + platformsUnknown);
    }

    display.success('Processing files for: ' + platformsToProcess);
    return Q.resolve(platformsToProcess);
}

function getImages(settings) {

    var imageObjects = {
        icon: null,
        splash: null
    };

    var promise = Q.resolve();

    if (settings.makeicon) {
        promise = promise.then(() => checkIconFile(settings.iconfile))
            .then((image) => {
                imageObjects.icon = image;
            });
    }
    if (settings.makesplash) {
        promise = promise.then(() => checkSplashFile(settings.splashfile))
            .then((image) => {
                imageObjects.splash = image;
            });
    }

    return promise.then(() => {
        return imageObjects;
    });

    function checkIconFile(iconFileName) {
      const result = sharp(iconFileName);
      return result.metadata()
      .then((image) => {
        if (image.width === image.height && (image.format === 'svg' || image.width >= 1024)) {
          result.__meta = image;
          display.success('Icon file ok (' + image.width + 'x' + image.height + ')');
        } else {
          display.error('Bad icon file (' + image.width + 'x' + image.height + ')');
          throw new Error('Bad image format');
        }
        return result;
      })
    }

    function checkSplashFile(splashFileName) {
      const result = sharp(splashFileName);
      return result.metadata()
      .then((image) => {
        if (image.width === image.height && (image.format === 'svg' || image.width >= 2732)) {
          result.__meta = image;
          display.success('splash file ok (' + image.width + 'x' + image.height + ')');
        } else {
          display.error('Bad splash file (' + image.width + 'x' + image.height + ')');
          throw new Error('Bad image format');
        }
        return result;
      })
    }

}

function checkOutPutDir(settings) {
    var dir = settings.outputdirectory;

    return fs.pathExists(dir)
        .then((exists) => {
            if (exists) {
                display.success('Output directory ok (' + dir + ')');
            } else {
                display.error('Output directory not found (' + dir + ')');
                throw ('Output directory not found: ' + dir);
            }
        });

}

function generateForConfig(imageObj, settings, config) {
    var platformPath = path.join(settings.outputdirectory, config.path);

    var transformIcon = (definition) => {
      var image = imageObj.icon;

      var outputFilePath = path.join(platformPath, definition.name);
      var outDir = path.dirname(outputFilePath);
      return fs.ensureDir(outDir).then(()=>{
        return image.resize(definition.size, definition.size)
        .toFile(outputFilePath);
      })
    };

    var transformSplash = (definition) => {
        var image = imageObj.splash;

        var x = (image.__meta.width - definition.width) / 2;
        var y = (image.__meta.height - definition.height) / 2;
        var width = definition.width;
        var height = definition.height;

        var outputFilePath = path.join(platformPath, definition.name);
        var outDir = path.dirname(outputFilePath);
        return fs.ensureDir(outDir).then(()=>{
          return image.resize(width, height)
          .crop(sharp.strategy.entropy)
          .toFile(outputFilePath)
        })
    };

    return fs.ensureDir(platformPath)
        .then(() => {

            var definitions = config.definitions;
            var sectionName = "Generating " + config.type + ' files for ' + config.platform;
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
                switch (config.type) {
                    case 'icon':
                        transformPromise = transformPromise.then(() => transformIcon(def));
                        break;
                    case 'splash':
                        transformPromise = transformPromise.then(() => transformSplash(def));
                        break;
                }
                return transformPromise;
            }).then(() => {
                gauge.disable();
                display.success('Generated ' + config.type + ' files for ' + config.platform);
            }).catch((err) => {
                gauge.disable();
                throw (err);
            });

        });
}

function generate(imageObj, settings) {

    display.header('Generating files');

    var configs = [];

    g_selectedPlatforms.forEach((platform) => {
        PLATFORMS[platform].definitions.forEach((def) => configs.push(require(def)));
    });

    var filteredConfigs = _.filter(configs, (config) => {
        if (config.type === 'icon' && settings.makeicon) return true;
        if (config.type === 'splash' && settings.makesplash) return true;
        return false;
    });

    return Q.mapSeries(filteredConfigs, (config) => {
            return generateForConfig(imageObj, settings, config);
        })
        .then(() => {
            //display.success("Successfully generated all files");
        });

}

function catchErrors(err) {
    if (err) {
      console.log('Error: ', err.message);
      process.exit(1);
    }
}

// cli helper configuration

function processList(val) {
    return val.split(',');
}

var pjson = require('./package.json');
program
    .version(pjson.version)
    .description(pjson.description)
    .option('-i, --icon [optional]', 'optional icon file path (default: ./resources/icon)')
    .option('-s, --splash [optional]', 'optional splash file path (default: ./resources/splash)')
    .option('-p, --platforms [optional]', 'optional platform token comma separated list (default: all platforms processed)', processList)
    .option('-o, --outputdir [optional]', 'optional output directory (default: ./resources/)')
    .option('-I, --makeicon [optional]', 'option to process icon files only')
    .option('-S, --makesplash [optional]', 'option to process splash files only')
    .parse(process.argv);

// app settings and default values

var g_settings = {
    iconfile: program.icon || path.join('.', 'resources', 'icon'),
    splashfile: program.splash || path.join('.', 'resources', 'splash'),
    platforms: program.platforms || undefined,
    outputdirectory: program.outputdir || path.join('.', 'resources'),
    makeicon: program.makeicon || (!program.makeicon && !program.makesplash) ? true : false,
    makesplash: program.makesplash || (!program.makeicon && !program.makesplash) ? true : false
};

// app entry point

console.log("***************************");
console.log("cordova-res-generator " + pjson.version);
console.log("***************************");

check(g_settings)
    .then(() => generate(g_imageObjects, g_settings))
    .catch((err) => catchErrors(err));
