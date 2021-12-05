import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import InsertHtmlCommand from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import { oneLineTrim } from 'common-tags';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

module('Unit | commands | insert-html-command-test', (hooks) => {
  const ctx = new ModelTestContext();
  let command: InsertHtmlCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertHtmlCommand(ctx.model);
  });

  test('inserts correctly in empty document', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    command.execute(htmlToInsert, range);

    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
  test('inserts correctly in document with empty textnode', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text/>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text/>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    command.execute(htmlToInsert, range);

    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test('inserts correctly inside textnode', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>ab</text>
        <div>
          <text>hello world</text>
        </div>
        <text>cd</text>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 2, 2);
    command.execute(htmlToInsert, range);

    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
  test('correctly replaces part of textnode', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>a</text>
        <div>
          <text>hello world</text>
        </div>
        <text>d</text>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 1, 3);
    command.execute(htmlToInsert, range);

    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
  test('correctly replaces complex range', (assert) => {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">abcd</text>
          <span>
            <span/>
            <span>
              <text __id="rangeEnd">efgh</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>a</text>
          <div>
            <text>hello world</text>
          </div>
          <span>
            <span>
              <text>h</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    ctx.model.fillRoot(initial);

    const start = ModelPosition.fromInTextNode(rangeStart, 1);
    const end = ModelPosition.fromInTextNode(rangeEnd, 3);
    const range = new ModelRange(start, end);
    command.execute(htmlToInsert, range);

    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test('can insert bold text as a direct child of the root node', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>`;
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text bold="true">my text</text>
      </modelRoot>`;
    const htmlToInsert = oneLineTrim`<strong>my text</strong>`;
    ctx.model.fillRoot(initial);
    const root = ctx.model.rootModelNode;
    const range = ModelRange.fromInElement(root, 0, root.getMaxOffset());
    command.execute(htmlToInsert, range);
    assert.true(root.sameAs(expected));
  });
});
