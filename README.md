# select-env

runs you callbacks based on passing tests

useful for making ugly code more readable, by replacing the if-else jungle with a fluent api

comes with (naive) tests for `browser` and `server`

# install

## npm

    npm install selectenv

## bower

    bower install selectenv

# examples

    var selectEnv = require("selectenv");

    var runner = selectEnv.server(function () {
        console.log("Node servers rock my world");
    }).
    browser(function () {
        console.log("Browsers are cool");
    });

    runner();

## add custom tests

    var selectEnv = require("select-env");

    selectEnv.addTest("android", function () {
        return typeof(window) !== "undefined" && (/Android/).test(window.navigator.userAgent);
    });

    // Your new test is now exposed as a function
    var runner = selectEnv.android(function () {
        console.log("Beep boop, Android will prevail");
    });

# methods

    var selectEnv = require("selectenv");

## addTest(label, testfn)

add a new test. the test is exposed as a function with the same name on `selectEnv`. `testfn` should return a boolean value. `label` can contain alphanumeric characters and the underscore, but must begin with a character.

## lock()

write protect the current test suite

## flush()

restore default state. used in testing.
