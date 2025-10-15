// react-native.config.js
module.exports = {
    dependencies: {
      'react-native-ble-peripheral': {
        platforms: { android: null }, // iOS-only for you
      },
      'react-native-ble-advertiser': {
        platforms: { android: null }, // make sure Android never tries to build this
      },
    },
  };
  