#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

var _parser = _interopRequireDefault(require("gradle-to-js/lib/parser"));

var _path = _interopRequireDefault(require("path"));

var _plist = _interopRequireDefault(require("plist"));

var _versionUtils = require("./versionUtils");

var display = console.log; // eslint-disable-line no-console

var paths = {
  androidManifest: './android/app/src/main/AndroidManifest.xml',
  buildGradle: './android/app/build.gradle',
  infoPlist: './ios/<APP_NAME>/Info.plist',
  packageJson: './package.json'
};

function getPackageJson() {
  return JSON.parse(_fs["default"].readFileSync(paths.packageJson));
}

function setPackageVersion(versionText) {
  var packageJSON = null;

  try {
    packageJSON = getPackageJson();
    display(_chalk["default"].yellow("Will set package version to ".concat(_chalk["default"].bold.underline(versionText))));
    packageJSON.version = versionText;

    _fs["default"].writeFileSync(paths.packageJson, "".concat(JSON.stringify(packageJSON, null, '\t'), "\n"));

    display(_chalk["default"].green("Version replaced in ".concat(_chalk["default"].bold('package.json'))));
  } catch (err) {
    display(_chalk["default"].red("".concat(_chalk["default"].bold.underline('ERROR:'), " Cannot find file with name ").concat(_path["default"].resolve(paths.packageJson))));
    process.exit(1);
  }
}

function getIOSVersionInfo(versionText) {
  var versionInfo = {
    currentVersionCode: null,
    currentVersion: null,
    version: null,
    versionCode: null
  };

  try {
    var plistInfo = _plist["default"].parse(_fs["default"].readFileSync(paths.infoPlist, 'utf8'));

    var currentVersion = (0, _versionUtils.versionStringToVersion)(plistInfo.CFBundleShortVersionString);
    var versionCodeParts = plistInfo.CFBundleVersion.toString().split('.');
    var currentVersionCode = +versionCodeParts[versionCodeParts.length - 1];
    var version = (0, _versionUtils.versionStringToVersion)(versionText, currentVersion, currentVersionCode);
    versionInfo = {
      currentVersionCode: currentVersionCode,
      currentVersion: currentVersion,
      version: version,
      versionCode: version.build
    };
  } catch (err) {
    display(_chalk["default"].yellowBright("".concat(_chalk["default"].bold.underline('WARNING:'), " Cannot find key CFBundleShortVersionString in file ").concat(_path["default"].resolve(paths.infoPlist), ". IOS version configuration will be skipped")));
  }

  return versionInfo;
}

function setIosApplicationVersion(_x) {
  return _setIosApplicationVersion.apply(this, arguments);
}

function _setIosApplicationVersion() {
  _setIosApplicationVersion = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(versionText) {
    var _yield$getIOSVersionI, version, bundleVersion, plistInfo;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getIOSVersionInfo(versionText);

          case 2:
            _yield$getIOSVersionI = _context2.sent;
            version = _yield$getIOSVersionI.version;
            bundleVersion = "".concat(version.major, ".").concat(version.minor, ".").concat(version.patch, ".").concat(version.build);

            if (version) {
              display('');
              display(_chalk["default"].yellow('IOS version info:'));
              display(version);
              display('');
              display(_chalk["default"].yellow("Will set CFBundleShortVersionString to ".concat(_chalk["default"].bold.underline(versionText))));
              display(_chalk["default"].yellow("Will set CFBundleVersion to ".concat(_chalk["default"].bold.underline(bundleVersion))));

              try {
                plistInfo = _plist["default"].parse(_fs["default"].readFileSync(paths.infoPlist, 'utf8'));
                plistInfo.CFBundleShortVersionString = versionText;
                plistInfo.CFBundleVersion = bundleVersion;

                _fs["default"].writeFileSync(paths.infoPlist, _plist["default"].build(plistInfo), 'utf8');

                display(_chalk["default"].green("Version replaced in ".concat(_chalk["default"].bold('Info.plist'))));
              } catch (err) {
                display(_chalk["default"].yellowBright("".concat(_chalk["default"].bold.underline('WARNING:'), " Cannot find file with name ").concat(_path["default"].resolve(paths.infoPlist), ". This file will be skipped")));
              }
            }

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _setIosApplicationVersion.apply(this, arguments);
}

function getAndroidVersionInfo(_x2) {
  return _getAndroidVersionInfo.apply(this, arguments);
}

function _getAndroidVersionInfo() {
  _getAndroidVersionInfo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(versionText) {
    var versionInfo, gradle, currentVersion, currentVersionCode, version;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            versionInfo = {
              currentVersionCode: null,
              currentVersion: null,
              version: null,
              versionCode: null
            };
            _context3.prev = 1;
            _context3.next = 4;
            return _parser["default"].parseFile(paths.buildGradle);

          case 4:
            gradle = _context3.sent;
            currentVersion = (0, _versionUtils.versionStringToVersion)(gradle.android.defaultConfig.versionName);
            currentVersionCode = +gradle.android.defaultConfig.versionCode;
            version = (0, _versionUtils.versionStringToVersion)(versionText, currentVersion, currentVersionCode);
            versionInfo = {
              currentVersionCode: currentVersionCode,
              currentVersion: currentVersion,
              version: version,
              versionCode: (0, _versionUtils.versionToVersionCode)(version)
            };
            _context3.next = 14;
            break;

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](1);
            display(_chalk["default"].yellowBright("".concat(_chalk["default"].bold.underline('WARNING:'), " Cannot find attribute versionCode in file ").concat(_path["default"].resolve(paths.buildGradle), ". Android version configuration will be skipped")));

          case 14:
            return _context3.abrupt("return", versionInfo);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 11]]);
  }));
  return _getAndroidVersionInfo.apply(this, arguments);
}

function setAndroidApplicationVersion(_x3) {
  return _setAndroidApplicationVersion.apply(this, arguments);
}

function _setAndroidApplicationVersion() {
  _setAndroidApplicationVersion = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(versionText) {
    var _yield$getAndroidVers, version, versionCode, buildGradle, newBuildGradle, androidManifest, newAndroidManifest;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getAndroidVersionInfo(versionText);

          case 2:
            _yield$getAndroidVers = _context4.sent;
            version = _yield$getAndroidVers.version;
            versionCode = _yield$getAndroidVers.versionCode;

            if (versionCode) {
              display('');
              display(_chalk["default"].yellow('Android version info:'));
              display(version);
              display('');
              display(_chalk["default"].yellow("Will set Android version to ".concat(_chalk["default"].bold.underline(versionText))));
              display(_chalk["default"].yellow("Will set Android version code to ".concat(_chalk["default"].bold.underline(versionCode))));

              try {
                buildGradle = _fs["default"].readFileSync(paths.buildGradle, 'utf8');
                newBuildGradle = buildGradle.replace(/versionCode \d+/g, "versionCode ".concat(versionCode)).replace(/versionName "[^"]*"/g, "versionName \"".concat(versionText, "\""));

                _fs["default"].writeFileSync(paths.buildGradle, newBuildGradle, 'utf8');

                display(_chalk["default"].green("Version replaced in ".concat(_chalk["default"].bold('build.gradle'))));
              } catch (err) {
                display(_chalk["default"].yellowBright("".concat(_chalk["default"].bold.underline('WARNING:'), " Cannot find file with name ").concat(_path["default"].resolve(paths.buildGradle), ". This file will be skipped")));
              }

              try {
                androidManifest = _fs["default"].readFileSync(paths.androidManifest, 'utf8');

                if (androidManifest.includes('android:versionCode') || androidManifest.includes('android:versionName')) {
                  newAndroidManifest = androidManifest.replace(/android:versionCode="\d*"/g, "android:versionCode=\"".concat(versionCode, "\"")).replace(/android:versionName="[^"]*"/g, "android:versionName=\"".concat(versionText, "\""));

                  _fs["default"].writeFileSync(paths.androidManifest, newAndroidManifest, 'utf8');

                  display(_chalk["default"].green("Version replaced in ".concat(_chalk["default"].bold('AndroidManifest.xml'))));
                }
              } catch (err) {
                display(_chalk["default"].yellowBright("".concat(_chalk["default"].bold.underline('WARNING:'), " Cannot find file with name ").concat(_path["default"].resolve(paths.androidManifest), ". This file will be skipped")));
              }
            }

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _setAndroidApplicationVersion.apply(this, arguments);
}

var changeVersion = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var versionText, _getPackageJson, infoPListPath;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            versionText = process.argv[2];
            _getPackageJson = getPackageJson(), infoPListPath = _getPackageJson.infoPListPath;
            setPackageVersion(versionText);
            paths.infoPlist = infoPListPath || paths.infoPlist.replace('<APP_NAME>', appName);
            _context.next = 6;
            return setAndroidApplicationVersion(versionText);

          case 6:
            _context.next = 8;
            return setIosApplicationVersion(versionText);

          case 8:
            display('');

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function changeVersion() {
    return _ref.apply(this, arguments);
  };
}();

changeVersion();