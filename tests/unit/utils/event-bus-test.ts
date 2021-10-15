import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import {module, test} from "qunit";
import sinon, {SinonFakeTimers} from "sinon";
import {DummyEvent, RdfaEventContext} from "@lblod/ember-rdfa-editor/core/editor-events";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import {RdfaContext, RdfaContextFactory} from "@lblod/ember-rdfa-editor/core/rdfa-context";


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
    // callback is registered after callback2, so is called first
    eventBus.on("dummy", callback2);
    eventBus.on("dummy", callback);
    eventBus.emit(new DummyEvent());
    assert.true(callback.calledOnce);
    assert.true(callback2.notCalled);

  });

  test("Correctly filters on context", function (assert) {
    const eventBus = new EventBus();

    // language=XML
    const {elements: {personElement}} = vdom`
      <modelRoot>
        <div __id="personElement" vocab="http://schema.org/" typeof="Person">Arne Bertrand</div>
      </modelRoot>
    `;
    const context = new RdfaEventContext(personElement);
    const contextEvent = new DummyEvent({context});
    const rdfaContext: RdfaContext = {types: ["http://schema.org/Person"], vocab: "http://schema.org/"};
    const contextListener = sinon.fake();
    eventBus.on("dummy", contextListener, {context: RdfaContextFactory.serialize(rdfaContext)});

    const normalListener = sinon.fake();
    const normalEvent = new DummyEvent();
    eventBus.on("dummy", normalListener);

    eventBus.emit(contextEvent);
    assert.true(contextListener.calledOnce);
    assert.true(normalListener.calledOnce);

    eventBus.emit(normalEvent);
    assert.true(contextListener.calledOnce);
    assert.true(normalListener.callCount === 2);
  });

  test("correctly bubbles through contexts", function (assert) {
    const eventBus = new EventBus();

    // language=XML
    const {elements: {givenNameElement}} = vdom`
      <modelRoot>
        <div __id="personElement" vocab="http://schema.org/" typeof="Person">
          <span __id="givenNameElement" property="givenName">Arne</span>
          <span property="familyName">Bertrand</spanpr>
        </div>
      </modelRoot>
    `;
    const context = new RdfaEventContext(givenNameElement);
    const contextEvent = new DummyEvent({context});
    console.log(context.serialize());

    const givenNameContext: RdfaContext = {properties: ["http://schema.org/givenName"]};
    console.log(RdfaContextFactory.serialize(givenNameContext));
    const givenNameListener = sinon.fake();
    eventBus.on("dummy", givenNameListener, {context: RdfaContextFactory.serialize(givenNameContext)});

    const personContext: RdfaContext = {types: ["http://schema.org/Person"], vocab: "http://schema.org/"};
    const personListener = sinon.fake();
    eventBus.on("dummy", personListener, {context: RdfaContextFactory.serialize(personContext)});

    const rootListener = sinon.fake();
    eventBus.on("dummy", rootListener);

    eventBus.emit(contextEvent);

    assert.true(givenNameListener.calledOnce);
    assert.true(personListener.calledOnce);
    assert.true(rootListener.calledOnce);

  });

  test("calls equal-priority listeners in reverse order of registration", function (assert) {
    const eventBus = new EventBus();
    const event = new DummyEvent();

    const calledListeners: string[] = [];
    const listenerA = () => {
      calledListeners.push("A");
    };
    const listenerB = () => {
      calledListeners.push("B");
    };

    eventBus.on("dummy", listenerA);
    eventBus.on("dummy", listenerB);
    eventBus.emit(event);

    assert.strictEqual(calledListeners[0], "B");
    assert.strictEqual(calledListeners[1], "A");


  });
});
