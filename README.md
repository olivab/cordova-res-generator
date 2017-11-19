# cordova-res-generator

Automatic icon and splash screen resizing tool for **Cordova**/**Ionic**/**PhoneGap** based applications.

It automatically resizes and copies your ```icon.png``` and ```splash.png``` files for mobile platforms.

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

### Options

  Options:

    -V, --version               output the version number
    -i, --icon [optional]       optional icon file path (default: ./resources/icon.png)
    -s, --splash [optional]     optional splash file path (default: ./resources/splash.png)
    -p, --platforms [optional]  optional comma separated platform token list without any space (default: all platforms processed)
                                (available tokens: android, ios, windows, blackberry10)
    -o, -outputdir [optional]   optional output directory (default: ./resources/)
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