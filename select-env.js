var _ = require("underscore");
var rValidLabel = /[a-z][a-z0-9_$]+/;
var tests = {};
var overwrite = true;

function makeRunner(options) {
    options = options || {};

    function run() {
        _.each(tests, function (test, label) {
            if ((label in options) && test()) {
                options[label].fn.apply(options[label].ctx || this, arguments);
            }
        });
    }

    function setup(label) {
        return function (cb, ctx) {
            if (! cb || typeof(cb) !== "function") {
                throw new Error("Can't assign without a callback");
            }

            options[label] = { fn: cb, ctx: ctx };
            return run;
        };
    }

    _.each(tests, function (testfn, label) {
        run[label] = setup(label);
    });

    return run;
}

/* Test result memoized */
function wrapTest(testfn) {
    var result = null;

    return function () {
        if (result === null) {
            result = testfn();
        }

        return result;
    };
}

/* Exports each test by wrapping makeRunner */
function wrapMakeRunner(label) {
    return function (cb, ctx) {
        if (! cb || typeof(cb) !== "function") {
            throw new Error("Can't assign without a callback");
        }
        var opts = {};
        opts[label] = { fn: cb, ctx: ctx };
        return makeRunner(opts);
    };
}

function addTest(label, testfn) {
    if (typeof(testfn) !== "function") {
        throw new Error("Test must be accompanied by a function");
    }

    if (! rValidLabel.test(label)) {
        throw new Error("Invalid environment label");
    }

    if (label in tests && !overwrite) {
        throw new Error("Can't overwrite existing tests after locking");
    }

    tests[label] = wrapTest(testfn);
    module.exports[label] = wrapMakeRunner(label);
}

function createDefaultTests() {
    addTest("server", function () {
        return typeof(process) !== "undefined";
    });

    addTest("browser", function () {
        return typeof(window) !== "undefined";
    });
}

function lock() {
    overwrite = false;
}

/* Helper for testing, flushes all tests and restores default state */
function flush() {
    tests = {};
    overwrite = true;
    createDefaultTests();
}

module.exports = {
    addTest: addTest,
    flush: flush,
    lock: lock
};

createDefaultTests();
