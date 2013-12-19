(function () {
    function factory(require, exports, module) {
        var rValidLabel = /[a-z][a-z0-9_$]+/;
        var tests = {};
        var overwrite = true;

        var each = function (array, cb) {
            if (array.forEach) return array.forEach(cb);

            var i = 0, l = array.length;
            for (; i < l; i++) {
                cb(array[i]);
            }
        };

        var keys = function (object) {
            if (Object.keys) return Object.keys(object);

            var keys = [], key;
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            return keys;
        };

        function makeRunner(options) {
            options = options || {};

            function run() {
                var args = arguments;
                var self = this;
                var retval;

                each(keys(tests), function (label) {
                    var test = tests[label];
                    if ((label in options) && test()) {
                        retval = options[label].fn.apply(options[label].ctx || self, args);
                    }
                });

                return retval;
            }

            function setup(label) {
                return function (cb, ctx) {
                    if (! cb || typeof(cb) !== "function") {
                        throw new Error("Can't assign without a callback");
                    }

                    options[label] = { fn: cb, ctx: ctx };
                    return run;
                };
            }

            each(keys(tests), function (label) {
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
                if (! cb || typeof(cb) !== "function") {
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
            exports[label] = wrapMakeRunner(label);
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

        createDefaultTests();

        exports.addTest = addTest;
        exports.flush = flush;
        exports.lock = lock;

        return exports;
    }

    if (typeof(module) === "object") {
        factory(require, module.exports, module);
    } else if (typeof(define) === "function" && define.amd) {
        define(factory);
    } else {
        window.selectEnv = factory(null, window.selectEnv = {});
    }
}());
