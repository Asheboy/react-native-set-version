#!/usr/bin/env node
"use strict";

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

var _parser = _interopRequireDefault(require("gradle-to-js/lib/parser"));

var _path = _interopRequireDefault(require("path"));

var _plist = _interopRequireDefault(require("plist"));

var _versionUtils = require("./versionUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const display = console.log; // eslint-disable-line no-console

const paths = {
  androidManifest: './android/app/src/main/AndroidManifest.xml',
  buildGradle: './android/app/build.gradle',
  infoPlist: './ios/<APP_NAME>/Info.plist',
  packageJson: './package.json'
};

function getPackageJson() {
  return JSON.parse(_fs.default.readFileSync(paths.packageJson));
}

function setPackageVersion(versionText) {
  let packageJSON = null;

  try {
    packageJSON = getPackageJson();
    display(_chalk.default.yellow(`Will set package version to ${_chalk.default.bold.underline(versionText)}`));
    packageJSON.version = versionText;

    _fs.default.writeFileSync(paths.packageJson, `${JSON.stringify(packageJSON, null, '\t')}\n`);

    display(_chalk.default.green(`Version replaced in ${_chalk.default.bold('package.json')}`));
  } catch (err) {
    display(_chalk.default.red(`${_chalk.default.bold.underline('ERROR:')} Cannot find file with name ${_path.default.resolve(paths.packageJson)}`));
    process.exit(1);
  }
}

function getIOSVersionInfo(versionText) {
  let versionInfo = {
    currentVersionCode: null,
    currentVersion: null,
    version: null,
    versionCode: null
  };

  try {
    const plistInfo = _plist.default.parse(_fs.default.readFileSync(paths.infoPlist, 'utf8'));

    const currentVersion = (0, _versionUtils.versionStringToVersion)(plistInfo.CFBundleShortVersionString);
    const versionCodeParts = plistInfo.CFBundleVersion.toString().split('.');
    const currentVersionCode = +versionCodeParts[versionCodeParts.length - 1];
    const version = (0, _versionUtils.versionStringToVersion)(versionText, currentVersion, currentVersionCode);
    versionInfo = {
      currentVersionCode,
      currentVersion,
      version,
      versionCode: version.build
    };
  } catch (err) {
    display(_chalk.default.yellowBright(`${_chalk.default.bold.underline('WARNING:')} Cannot find key CFBundleShortVersionString in file ${_path.default.resolve(paths.infoPlist)}. IOS version configuration will be skipped`));
  }

  return versionInfo;
}

async function setIosApplicationVersion(versionText) {
  const {
    version
  } = await getIOSVersionInfo(versionText);
  const bundleVersion = `${version.major}.${version.minor}.${version.patch}.${version.build}`;

  if (version) {
    display('');
    display(_chalk.default.yellow('IOS version info:'));
    display(version);
    display('');
    display(_chalk.default.yellow(`Will set CFBundleShortVersionString to ${_chalk.default.bold.underline(versionText)}`));
    display(_chalk.default.yellow(`Will set CFBundleVersion to ${_chalk.default.bold.underline(bundleVersion)}`));

    try {
      const plistInfo = _plist.default.parse(_fs.default.readFileSync(paths.infoPlist, 'utf8'));

      plistInfo.CFBundleShortVersionString = versionText;
      plistInfo.CFBundleVersion = bundleVersion;

      _fs.default.writeFileSync(paths.infoPlist, _plist.default.build(plistInfo), 'utf8');

      display(_chalk.default.green(`Version replaced in ${_chalk.default.bold('Info.plist')}`));
    } catch (err) {
      display(_chalk.default.yellowBright(`${_chalk.default.bold.underline('WARNING:')} Cannot find file with name ${_path.default.resolve(paths.infoPlist)}. This file will be skipped`));
    }
  }
}

async function getAndroidVersionInfo(versionText) {
  let versionInfo = {
    currentVersionCode: null,
    currentVersion: null,
    version: null,
    versionCode: null
  };

  try {
    const gradle = await _parser.default.parseFile(paths.buildGradle);
    const currentVersion = (0, _versionUtils.versionStringToVersion)(gradle.android.defaultConfig.versionName);
    const currentVersionCode = +gradle.android.defaultConfig.versionCode;
    const version = (0, _versionUtils.versionStringToVersion)(versionText, currentVersion, currentVersionCode);
    versionInfo = {
      currentVersionCode,
      currentVersion,
      version,
      versionCode: (0, _versionUtils.versionToVersionCode)(version)
    };
  } catch (err) {
    display(_chalk.default.yellowBright(`${_chalk.default.bold.underline('WARNING:')} Cannot find attribute versionCode in file ${_path.default.resolve(paths.buildGradle)}. Android version configuration will be skipped`));
  }

  return versionInfo;
}

async function setAndroidApplicationVersion(versionText) {
  const {
    version,
    versionCode
  } = await getAndroidVersionInfo(versionText);

  if (versionCode) {
    display('');
    display(_chalk.default.yellow('Android version info:'));
    display(version);
    display('');
    display(_chalk.default.yellow(`Will set Android version to ${_chalk.default.bold.underline(versionText)}`));
    display(_chalk.default.yellow(`Will set Android version code to ${_chalk.default.bold.underline(versionCode)}`));

    try {
      const buildGradle = _fs.default.readFileSync(paths.buildGradle, 'utf8');

      const newBuildGradle = buildGradle.replace(/versionCode \d+/g, `versionCode ${versionCode}`).replace(/versionName "[^"]*"/g, `versionName "${versionText}"`);

      _fs.default.writeFileSync(paths.buildGradle, newBuildGradle, 'utf8');

      display(_chalk.default.green(`Version replaced in ${_chalk.default.bold('build.gradle')}`));
    } catch (err) {
      display(_chalk.default.yellowBright(`${_chalk.default.bold.underline('WARNING:')} Cannot find file with name ${_path.default.resolve(paths.buildGradle)}. This file will be skipped`));
    }

    try {
      const androidManifest = _fs.default.readFileSync(paths.androidManifest, 'utf8');

      if (androidManifest.includes('android:versionCode') || androidManifest.includes('android:versionName')) {
        const newAndroidManifest = androidManifest.replace(/android:versionCode="\d*"/g, `android:versionCode="${versionCode}"`).replace(/android:versionName="[^"]*"/g, `android:versionName="${versionText}"`);

        _fs.default.writeFileSync(paths.androidManifest, newAndroidManifest, 'utf8');

        display(_chalk.default.green(`Version replaced in ${_chalk.default.bold('AndroidManifest.xml')}`));
      }
    } catch (err) {
      display(_chalk.default.yellowBright(`${_chalk.default.bold.underline('WARNING:')} Cannot find file with name ${_path.default.resolve(paths.androidManifest)}. This file will be skipped`));
    }
  }
}

const changeVersion = async () => {
  const versionText = process.argv[2];
  const {
    infoPListPath
  } = getPackageJson();
  setPackageVersion(versionText);
  paths.infoPlist = infoPListPath || paths.infoPlist.replace('<APP_NAME>', appName);
  await setAndroidApplicationVersion(versionText);
  await setIosApplicationVersion(versionText);
  display('');
};

changeVersion();