var assert = require("assert");
var sinon = require("sinon");

describe("src/select-env", function () {
    var selectEnv;

    beforeEach(function () {
        // Unload
        Object.keys(require.cache).forEach(function (key) {
            if (/select-env\.js$/.test(key)) {
                delete require.cache[key];
            }
        });
        selectEnv = require("../src/select-env");
    });

    it("exports flush", function () {
        assert.equal("function", typeof selectEnv.flush);
    });

    it("exports addTest", function () {
        assert.equal("function", typeof selectEnv.addTest);
    });

    it("exports server", function () {
        assert.equal("function", typeof selectEnv.server);
    });

    it("exports browser", function () {
        assert.equal("function", typeof selectEnv.browser);
    });

    it("exports added tests", function () {
        selectEnv.addTest("nevertrue", function () {
            return false;
        });

        assert.equal("function", typeof selectEnv.nevertrue);
    });

    it("has a fluent interface", function () {
        assert.equal("function", typeof selectEnv.server(function(){}).browser);
    });

    it("runs tests only once", function () {
        var testspy = sinon.stub().returns(true);
        var runspy = sinon.spy();

        selectEnv.addTest("alwaystrue", testspy);

        var runner = selectEnv.alwaystrue(runspy);

        runner();
        runner();

        assert.ok(testspy.calledOnce);
        assert.ok(runspy.calledTwice);
    });

    it("runs tests only on demand", function () {
        var shouldrun = sinon.stub().returns(true);
        var shouldnotrun = sinon.stub().returns(true);
        var runspy = sinon.spy();

        selectEnv.addTest("aa", shouldrun);
        selectEnv.addTest("bb", shouldnotrun);

        var runner = selectEnv.aa(runspy);

        runner();

        assert.ok(runspy.calledOnce);
        assert.ok(shouldrun.calledOnce);
        sinon.assert.notCalled(shouldnotrun);
    });

    it("throws if runner has no callback", function () {
        assert.throws(function () {
            selectEnv.browser();
        });

        assert.throws(function () {
            selectEnv.browser(function(){}).server();
        });
    });

    it("throws if test has no callback", function () {
        assert.throws(function () {
            selectEnv.addTest();
        });
    });

    it("throws if test has invalid label", function () {
        assert.throws(function () {
            selectEnv.addTest("a", function () {});
        });

        assert.throws(function () {
            selectEnv.addTest("0a", function () {});
        });

        assert.throws(function () {
            selectEnv.addTest("$a", function () {});
        });

        assert.throws(function () {
            selectEnv.addTest("_a", function () {});
        });

        assert.throws(function () {
            selectEnv.addTest("a-", function () {});
        });
    });

    it("runs all callbacks with matching tests", function () {
        var alwaystrue = sinon.stub().returns(true);
        var spy = sinon.spy();

        selectEnv.addTest("foo", alwaystrue);
        selectEnv.addTest("bar", alwaystrue);
        selectEnv.addTest("baz", alwaystrue);

        var runner = selectEnv.foo(spy).bar(spy).baz(spy);

        runner();

        assert.ok(spy.calledThrice);
    });

    it("runs only callbacks with matching tests", function () {
        var alwaystrue = sinon.stub().returns(true);
        var alwaysfalse = sinon.stub().returns(false);
        var spy = sinon.spy();

        selectEnv.addTest("foo", alwaystrue);
        selectEnv.addTest("bar", alwaysfalse);
        selectEnv.addTest("baz", alwaystrue);

        var runner = selectEnv.foo(spy).bar(spy).baz(spy);

        runner();

        assert.ok(spy.calledTwice);
    });

    it("throws when overwriting after locking", function () {
        selectEnv.protect();

        assert.throws(function () {
            selectEnv.addTest("server", function () {});
        });
    });

    it("proxies in all arguments", function () {
        var alwaystrue = sinon.stub().returns(true);
        var spy = sinon.spy();

        selectEnv.addTest("alwaystrue", alwaystrue);
        var runner = selectEnv.alwaystrue(spy);

        runner("foo", "bar", "baz");

        assert.ok(spy.calledWith("foo", "bar", "baz"));
    });

    it("preserves this", function () {
        var alwaystrue = sinon.stub().returns(true);
        selectEnv.addTest("alwaystrue", alwaystrue);

        var foo = {
            bar: "baz",
            fn: selectEnv.alwaystrue(function () {
                return this.bar;
            })
        };

        assert.equal("baz", foo.fn());
    });

    it("can enforce this", function () {
        var alwaystrue = sinon.stub().returns(true);
        selectEnv.addTest("alwaystrue", alwaystrue);

        var foo = {
            bar: "baz",
            fn: function () {
                return this.bar;
            }
        };

        var runner = selectEnv.alwaystrue(foo.fn, foo);

        assert.equal("baz", runner());
    });

    it("can freeze everything", function () {
        var spy = sinon.spy();

        selectEnv.addTest("first", spy);
        selectEnv.freeze();
        selectEnv.addTest("second", spy);

        assert.equal("function", typeof selectEnv.first);
        assert.equal("undefined", typeof selectEnv.second);
    });
});
