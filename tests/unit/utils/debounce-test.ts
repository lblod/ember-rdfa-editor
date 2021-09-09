import {module, test} from "qunit";
import sinon, {SinonFakeTimers} from "sinon";
import debounced from "@lblod/ember-rdfa-editor/utils/debounce";

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

    clock.tick(10);
    assert.true(callback.notCalled);

    debouncedCallback();
    assert.true(callback.notCalled);

    clock.tick(99);
    assert.true(callback.notCalled);

    clock.tick(1);
    assert.true(callback.calledOnce);

    clock.tick(200);
    assert.true(callback.calledOnce);


  });

});
