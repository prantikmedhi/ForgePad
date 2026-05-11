const { withAndroidManifest } = require("expo/config-plugins");

function setUsesCleartextTraffic(androidManifest) {
  const app = androidManifest?.manifest?.application?.[0];
  if (!app) {
    return androidManifest;
  }

  app.$ = app.$ || {};
  app.$["android:usesCleartextTraffic"] = "true";

  return androidManifest;
}

module.exports = function withAndroidLanCleartext(config) {
  return withAndroidManifest(config, (nextConfig) => {
    nextConfig.modResults = setUsesCleartextTraffic(nextConfig.modResults);
    return nextConfig;
  });
};
