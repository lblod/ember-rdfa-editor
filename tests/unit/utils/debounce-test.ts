import { debounced, debouncedAdjustable } from "@lblod/ember-rdfa-editor/archive/utils/debounce";
import {module, test} from "qunit";
import sinon, {SinonFakeTimers} from "sinon";


module("Unit | Utility | debounce", function (hooks) {

  let clock: SinonFakeTimers;
  hooks.before(() => {
    clock = sinon.useFakeTimers();
  });
  hooks.after(() => {
    clock.restore();
  });
  test("debounces a function as expected", function (assert) {
    const callback = sinon.fake();
    const debouncedCallback = debounced(callback, 100);

    debouncedCallback();
    assert.true(callback.notCalled);

    clock.tick(10);

    debouncedCallback();
    debouncedCallback();
    debouncedCallback();
    debouncedCallback();
    assert.true(callback.notCalled);
    debouncedCallback();

    clock.tick(99);
    assert.true(callback.notCalled);

    clock.tick(1);
    assert.true(callback.calledOnce);

    clock.tick(200);
    assert.true(callback.calledOnce);

  });

  test("debouncedAdjustable debounces a function as expected", function (assert) {
    const callback = sinon.fake();
    const debouncedCallback = debouncedAdjustable(callback);

    debouncedCallback(100);
    assert.true(callback.notCalled);

    clock.tick(10);

    debouncedCallback(100);
    debouncedCallback(100);
    debouncedCallback(100);
    debouncedCallback(100);
    assert.true(callback.notCalled);
    debouncedCallback(200);

    clock.tick(100);
    assert.true(callback.notCalled);


    clock.tick(200);
    assert.true(callback.calledOnce);

  });
});
