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

    var runner = selectEnv.
    server(function () {
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
        console.log("Beep boop");
    });

# methods

    var selectEnv = require("selectenv");

## addTest(label, testfn)

add a new test. The test is exposed as a function with the same name as `label` on the `selectEnv` object, `testfn` should return a boolean value. The `label` can contain alphanumeric characters and the underscore, but must begin with a character.

## protect()

write protect the current test suite. New tests can still be added, but attempting to overwrite existing tests will throw an error.

## freeze()

freeze the current test suite. No new tests can be added and existing tests cannot be flushed out.

## flush()

restore default state, unless frozen. used in testing.
