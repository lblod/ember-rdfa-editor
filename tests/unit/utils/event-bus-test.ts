import {module, test} from "qunit";
import sinon, {SinonFakeTimers} from "sinon";
import EventBus, {DummyEvent} from "@lblod/ember-rdfa-editor/utils/event-bus";


module("Unit | Utility | event-bus", function (hooks) {
  let clock: SinonFakeTimers;
  hooks.before(() => {
    clock = sinon.useFakeTimers();
  });
  hooks.after(() => {
    clock.restore();
  });
  test("emits debounced events", function (assert) {
    const callback = sinon.fake();
    EventBus.on("dummy", callback);
    EventBus.emitDebounced(100, new DummyEvent());

    assert.true(callback.notCalled);
    clock.tick(101);
    assert.true(callback.calledOnce);
  });
});
