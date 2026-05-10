# Android APK Build

ForgePad is configured to create an Android APK through EAS.

## Build

From the project root:

```bash
npm --prefix app install
npm --prefix app run build:apk
```

The build profile is `preview-apk` in `app/eas.json`.

## Put APK In Git

After EAS finishes, download the `.apk` artifact and place it at:

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

This machine currently has Java, but no Android SDK/ADB was detected.
