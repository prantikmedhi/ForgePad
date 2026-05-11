# Android APK Build

ForgePad Android app is configured through Expo.

## Build

From the project root:

```bash
npm --prefix app install
npm --prefix app run build:apk
```

The build profile is `preview-apk` in `app/eas.json`.

## Release APK In Git

Place release APK at:

```text
releases/apk/ForgePad-v0.1.0.apk
```

Then commit it with the release.

## Local Build Notes

A fully local APK build requires:

- Android SDK
- Android platform tools
- Gradle-compatible JDK
- signing keystore

Current validated release artifact is arm64-only to keep install size reasonable.

Recommended release file:

```text
releases/apk/ForgePad-v0.1.0.apk
```
