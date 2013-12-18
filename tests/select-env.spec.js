var assert = require("assert");
var sinon = require("sinon");
var selectEnv = require("../select-env");

describe("lib/select-env", function () {
    beforeEach(function () {
        selectEnv.flush();
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
        selectEnv.lock();

        assert.throws(function () {
            selectEnv.addTest("server", function () {});
        });
    });
});
