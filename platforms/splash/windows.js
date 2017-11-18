module.exports = {
    // https://docs.microsoft.com/en-us/windows/uwp/design/shell/tiles-and-notifications/app-assets
    platform: 'windows',
    type: 'splash',
    path: 'windows/splash/',
    definitions: [
        // Wide tile (Wide310x150Logo)
        
        // 100% scale	310x150	Wide310x150Logo.scale-100.png
        {
            name: "Wide310x150Logo.scale-100.png",
            width: 310,
            height: 150,
            comment: "Wide310x150Logo 100% scale"
        },
        // 125% scale	388x188	Wide310x150Logo.scale-125.png
        {
            name: "Wide310x150Logo.scale-125.png",
            width: 388,
            height: 188,
            comment: "Wide310x150Logo 125% scale"
        },
        // 150% scale	465x225	Wide310x150Logo.scale-150.png
        {
            name: "Wide310x150Logo.scale-150.png",
            width: 465,
            height: 225,
            comment: "Wide310x150Logo 150% scale"
        },
        // 200% scale	620x300	Wide310x150Logo.scale-200.png
        {
            name: "Wide310x150Logo.scale-200.png",
            width: 620,
            height: 300,
            comment: "Wide310x150Logo 200% scale"
        },
        // 400% scale	1240x600	Wide310x150Logo.scale-400.png
        {
            name: "Wide310x150Logo.scale-400.png",
            width: 1240,
            height: 600,
            comment: "Wide310x150Logo 400% scale"
        },

        // Splash screen (SplashScreen)
        
        // 100% scale	620x300	SplashScreen.scale-100.png
        {
            name: "SplashScreen.scale-100.png",
            width: 620,
            height: 300,
            comment: "Splash screen 100% scale"
        },
        // 125% scale	775x375	SplashScreen.scale-125.png
        {
            name: "SplashScreen.scale-125.png",
            width: 775,
            height: 375,
            comment: "Splash screen 125% scale"
        },
        // 150% scale	930x450	SplashScreen.scale-150.png
        {
            name: "SplashScreen.scale-150.png",
            width: 930,
            height: 450,
            comment: "Splash screen 150% scale"
        },
        // 200% scale	1240x600	SplashScreen.scale-200.png
        {
            name: "SplashScreen.scale-200.png",
            width: 1240,
            height: 600,
            comment: "Splash screen 200% scale"
        },
        // 400% scale	2480x1200	SplashScreen.scale-400.png
        {
            name: "SplashScreen.scale-400.png",
            width: 2480,
            height: 1200,
            comment: "Splash screen 400% scale"
        }
    ]
};