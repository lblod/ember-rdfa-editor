import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import {module, test} from "qunit";
import sinon, {SinonFakeTimers} from "sinon";
import {DummyEvent} from "@lblod/ember-rdfa-editor/core/editor-events";


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
    const eventBus = new EventBus();
    eventBus.on("dummy", callback);
    eventBus.emitDebounced(100, new DummyEvent());

    assert.true(callback.notCalled);
    clock.tick(101);
    assert.true(callback.calledOnce);
  });
  test("stopPropagation stops propagation", function (assert) {
    const callback = sinon.spy((event: DummyEvent) => {
      event.stopPropagation();
    });
    const callback2 = sinon.fake();
    const eventBus = new EventBus();
    eventBus.on("dummy", callback);
    eventBus.on("dummy", callback2);
    eventBus.emit(new DummyEvent());
    assert.true(callback.calledOnce);
    assert.true(callback2.notCalled);

  });
});
