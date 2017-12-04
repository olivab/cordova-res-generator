# cordova-res-generator

## Introduction

Automatic icon and splash screen resizing CLI tool for **Cordova**/**Ionic**/**PhoneGap** based applications.

It automatically resizes and copies your ```icon.png``` and ```splash.png``` files to platform dedicated directories.

It does **NOT require** any external binary libraries. **Javascript only**.

---

## Installation

    $ npm install cordova-res-generator -g

---

## Usage

### Required files

Add your ```icon.png``` (1024x1024 px) and ```splash.png``` (2732x2732 px) files to the 'resources' folder under the root of your cordova based project.

### Command line

    $ cordova-res-generator

or

    $ crgen

**ATTENTION:** while preserving source files, it overwrites previous output if any.

### Options

    -V, --version               output the version number
    -i, --icon [optional]       optional icon file path
                                (default: ./resources/icon.png)
    -s, --splash [optional]     optional splash file path
                                (default: ./resources/splash.png)
    -p, --platforms [optional]  optional platform token comma separated list
                                available tokens: android, ios, windows, blackberry10
                                (default: all platforms processed)
    -o, --outputdir [optional]  optional output directory
                                (default: ./resources/)
    -I, --makeicon [optional]   option to process icon files only
    -S, --makesplash [optional] option to process splash files only
    -h, --help                  output usage information

---

## Do yourself a favour

Add to your package.json a script definition to match your file generation needs.
This way, you won't have to type every now and again the whole command line with its options.

### An example

    {
      ...
      "scripts": {
        ...
          "resgen": "crgen -p android,ios"
      }
    }

All you have to do then is type :

    npm run resgen

NPM will cope with typing the whole command line for you.

---

## Platforms

Supported platforms:

- **iOS**
  - icons
  - splash screens
- **Android**
  - icons
  - splash screens
- **Windows**
  - icons
  - splash screens
- **Blackberry 10**
  - icons

---

## License

MIT