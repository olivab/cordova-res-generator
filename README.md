# cordova-res-generator

Automatic icon and splash screen resizing CLI tool for **Cordova**/**Ionic**/**PhoneGap** based applications.

It automatically resizes and copies your ```icon.png``` and ```splash.png``` files to platform dedicated directories.

It does **NOT require** any external binary libraries. **Javascript only**.

---

### Installation

    $ npm install cordova-res-generator -g

---

### Usage

Add your ```icon.png``` (1024x1024) and ```splash.png``` (2732x2732) files to the 'resources' folder under the root of your cordova based project.

Then run:

    $ cordova-res-generator

or

    $ crgen

**ATTENTION:** while preserving source files, it overwrites previous output if any.

Options:

    -V, --version               output the version number
    -i, --icon [optional]       optional icon file path
                                (default: ./resources/icon.png)
    -s, --splash [optional]     optional splash file path
                                (default: ./resources/splash.png)
    -p, --platforms [optional]  optional platform token comma separated list
                                available tokens: android, ios, windows, blackberry10
                                (default: all platforms processed)
    -o, -outputdir [optional]   optional output directory
                                (default: ./resources/)
    -h, --help                  output usage information

---

### Platforms

Supported platforms:

- **iOS**
    - icons
    - splash
- **Android**
    - icons
    - splash
- **Windows**
    - icons
    - splash
- **Blackberry 10**
    - icons

--- 

### License

MIT