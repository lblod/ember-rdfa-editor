import { module, test } from 'qunit';
import {
  EditorState,
  NodeSelection,
  SayView,
  Schema,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { link } from '@lblod/ember-rdfa-editor/plugins/link';
import { keyboardSelectionHandler } from '@lblod/ember-rdfa-editor/plugins/keyboard-selection-handler';

const TEST_SCHEMA = new Schema({
  nodes: {
    doc: { content: 'block+', toDOM: () => ['div', 0] },
    paragraph: {
      content: 'inline*',
      group: 'block',
      toDOM: () => ['p', 0],
    },
    horizontal_rule: { group: 'block', toDOM: () => ['hr'] },
    link: link(),
    text: { group: 'inline' },
  },
});

const paragraph = (...content: unknown[]) => ({
  type: 'paragraph',
  content,
});

const text = (value: string) => ({ type: 'text', text: value });

const linkNode = (value: string) => ({
  type: 'link',
  attrs: { href: 'http://example.com' },
  content: [text(value)],
});

// <paragraph>hello</paragraph><horizontal_rule/><paragraph>world</paragraph>
// paragraph 1 spans [0..7] (content 1..6), the rule spans [7..8]
// and paragraph 2 spans [8..15] (content 9..14).
const docWithAtomInMiddle = {
  type: 'doc',
  content: [
    paragraph(text('hello')),
    { type: 'horizontal_rule' },
    paragraph(text('world')),
  ],
};

// <paragraph>hello</paragraph><horizontal_rule/>
const docWithAtomAtEnd = {
  type: 'doc',
  content: [paragraph(text('hello')), { type: 'horizontal_rule' }],
};

// <horizontal_rule/><paragraph>hello</paragraph>
const docWithAtomAtStart = {
  type: 'doc',
  content: [{ type: 'horizontal_rule' }, paragraph(text('hello'))],
};

// <paragraph>hello</paragraph><paragraph>world</paragraph>
const docWithoutAtom = {
  type: 'doc',
  content: [paragraph(text('hello')), paragraph(text('world'))],
};

// <paragraph>text <link>link</link> more</paragraph>
// The paragraph spans [0..18] (content 1..17): "text " occupies
// [1..6], the link node spans [6..12] and " more" spans [12..17].
const docWithLinkNode = {
  type: 'doc',
  content: [paragraph(text('text '), linkNode('link'), text(' more'))],
};

// <paragraph>text <link>link</link></paragraph>
// The paragraph spans [0..13] (content 1..12): "text " occupies
// [1..6] and the link node spans [6..12].
const docWithLinkAtEnd = {
  type: 'doc',
  content: [paragraph(text('text '), linkNode('link'))],
};

// <paragraph><link>link</link> more</paragraph>
// The paragraph spans [0..13] (content 1..12): the link node spans
// [1..7] and " more" occupies [7..12].
const docWithLinkAtStart = {
  type: 'doc',
  content: [paragraph(linkNode('link'), text(' more'))],
};

// <paragraph><link>one</link><link>two</link></paragraph>
// "one" and "two" are 3 characters, so both link nodes have a
// node size of 5. The paragraph spans [0..12] (content 1..11):
// the first link node spans [1..6], the second one spans [6..11]
// and the caret position between both links is 6.
const docWithConsecutiveLinks = {
  type: 'doc',
  content: [paragraph(linkNode('one'), linkNode('two'))],
};

// <paragraph>text <link>link</link></paragraph><horizontal_rule/><paragraph>after</paragraph>
// paragraph 1 spans [0..13] (content 1..12: "text " occupies
// [1..6], the link node spans [6..12]), the rule spans [13..14] and
// paragraph 2 spans [14..21] (content 15..20).
const docWithLinkThenAtom = {
  type: 'doc',
  content: [
    paragraph(text('text '), linkNode('link')),
    { type: 'horizontal_rule' },
    paragraph(text('after')),
  ],
};

function setup(docJson: unknown, anchor: number, head = anchor) {
  const plugin = keyboardSelectionHandler();
  const state = EditorState.create({
    schema: TEST_SCHEMA,
    plugins: [plugin],
    doc: TEST_SCHEMA.nodeFromJSON(docJson),
  });
  const view = new SayView(null, { state });
  view.dispatch(
    view.state.tr.setSelection(
      TextSelection.create(view.state.doc, anchor, head),
    ),
  );

  const handleKey = (event: KeyboardEvent) => {
    const handler = plugin.props.handleKeyDown;
    if (!handler) {
      return false;
    }
    return handler.call(plugin, view, event) === true;
  };
  return { view, handleKey };
}

function keyDown(key: string, options: KeyboardEventInit = {}) {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

module('Unit | ProseMirror | keyboard-selection-handler', function () {
  module('block atoms', function () {
    test('Shift-ArrowDown selects the whole atom next to the caret', function (assert) {
      const { view, handleKey } = setup(docWithAtomInMiddle, 4);
      const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 4);
      assert.strictEqual(view.state.selection.to, 9);
      assert.strictEqual(view.state.selection.anchor, 4);
      assert.strictEqual(view.state.selection.head, 9);
    });

    test('Shift-ArrowUp selects the whole atom next to the caret', function (assert) {
      const { view, handleKey } = setup(docWithAtomInMiddle, 11);
      const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 6);
      assert.strictEqual(view.state.selection.to, 11);
      assert.strictEqual(view.state.selection.anchor, 11);
      assert.strictEqual(view.state.selection.head, 6);
    });

    test('Shift-ArrowDown selects the whole atom alongside the existing selection', function (assert) {
      const { view, handleKey } = setup(docWithAtomInMiddle, 2, 4);
      const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 2);
      assert.strictEqual(view.state.selection.to, 9);
      assert.strictEqual(view.state.selection.anchor, 2);
      assert.strictEqual(view.state.selection.head, 9);
    });

    test('Shift-ArrowUp selects the whole atom alongside the existing selection', function (assert) {
      const { view, handleKey } = setup(docWithAtomInMiddle, 13, 11);
      const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 6);
      assert.strictEqual(view.state.selection.to, 13);
      assert.strictEqual(view.state.selection.anchor, 13);
      assert.strictEqual(view.state.selection.head, 6);
    });

    test('nothing happens when the next block is not an atom', function (assert) {
      const { view, handleKey } = setup(docWithoutAtom, 4);
      const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

      assert.false(handled, 'event is not handled');
      assert.strictEqual(view.state.selection.head, 4);
    });

    test('nothing happens when there is no adjacent block at all', function (assert) {
      const { view, handleKey } = setup(docWithAtomInMiddle, 1);
      const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

      assert.false(handled, 'event is not handled');
      assert.strictEqual(view.state.selection.head, 1);
    });

    test('other keys and modifiers are not handled', function (assert) {
      const { view, handleKey } = setup(docWithAtomInMiddle, 4);

      assert.false(handleKey(keyDown('ArrowDown')), 'ArrowDown without shift');
      assert.false(
        handleKey(keyDown('ArrowDown', { shiftKey: true, ctrlKey: true })),
        'Shift-Ctrl-ArrowDown',
      );
      assert.false(
        handleKey(keyDown('Home', { shiftKey: true })),
        'Shift-Home',
      );
      assert.false(handleKey(keyDown('End', { shiftKey: true })), 'Shift-End');
      assert.strictEqual(view.state.selection.head, 4);
    });

    test('nothing happens when the selection is not a text selection', function (assert) {
      const plugin = keyboardSelectionHandler();
      const state = EditorState.create({
        schema: TEST_SCHEMA,
        plugins: [plugin],
        doc: TEST_SCHEMA.nodeFromJSON(docWithAtomAtEnd),
      });
      const view = new SayView(null, { state });
      view.dispatch(
        view.state.tr.setSelection(NodeSelection.create(view.state.doc, 7)),
      );
      const handler = plugin.props.handleKeyDown;
      assert.ok(handler);

      const handled =
        handler?.call(
          plugin,
          view,
          keyDown('ArrowDown', { shiftKey: true }),
        ) === true;

      assert.false(handled, 'event is not handled');
      assert.true(view.state.selection instanceof NodeSelection);
    });

    test('Shift-ArrowDown selects the atom itself when it is the last block of the document', function (assert) {
      const { view, handleKey } = setup(docWithAtomAtEnd, 4);
      const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.true(view.state.selection instanceof NodeSelection);
      assert.strictEqual(view.state.selection.from, 7);
      assert.strictEqual(view.state.selection.to, 8);
    });

    test('Shift-ArrowUp selects the atom itself when it is the first block of the document', function (assert) {
      const { view, handleKey } = setup(docWithAtomAtStart, 4);
      const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.true(view.state.selection instanceof NodeSelection);
      assert.strictEqual(view.state.selection.from, 0);
      assert.strictEqual(view.state.selection.to, 1);
    });
  });

  module('inline atoms', function () {
    test('Shift-ArrowRight selects the whole link node and jumps to the text after it', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 6);
      const handled = handleKey(keyDown('ArrowRight', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 6);
      assert.strictEqual(view.state.selection.to, 12);
      assert.strictEqual(view.state.selection.anchor, 6);
      assert.strictEqual(view.state.selection.head, 12);

      // the head is now at the text after the link, so extending
      // further happens natively again
      const handledAgain = handleKey(keyDown('ArrowRight', { shiftKey: true }));
      assert.false(handledAgain, 'next event is not handled');
      assert.strictEqual(view.state.selection.head, 12);
    });

    test('Shift-ArrowLeft selects the whole link node', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 12);
      const handled = handleKey(keyDown('ArrowLeft', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 6);
      assert.strictEqual(view.state.selection.to, 12);
      assert.strictEqual(view.state.selection.anchor, 12);
      assert.strictEqual(view.state.selection.head, 6);
    });

    module('vertical keys', function () {
      test('Shift-ArrowDown selects the whole link node after the caret', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 6);
        const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 12);
        assert.strictEqual(view.state.selection.anchor, 6);
        assert.strictEqual(view.state.selection.head, 12);
      });

      test('Shift-ArrowUp selects the whole link node before the caret', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 12);
        const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 12);
        assert.strictEqual(view.state.selection.anchor, 12);
        assert.strictEqual(view.state.selection.head, 6);
      });

      test('Shift-ArrowDown selects the whole link node alongside the existing selection', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 3, 6);
        const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 3);
        assert.strictEqual(view.state.selection.to, 12);
        assert.strictEqual(view.state.selection.anchor, 3);
        assert.strictEqual(view.state.selection.head, 12);
      });

      test('Shift-ArrowUp selects the whole link node alongside the existing selection', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 13, 12);
        const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 13);
        assert.strictEqual(view.state.selection.anchor, 13);
        assert.strictEqual(view.state.selection.head, 6);
      });

      test('Shift-ArrowDown before a link at the end of a paragraph moves the head to the end of the paragraph', function (assert) {
        const { view, handleKey } = setup(docWithLinkAtEnd, 6);
        const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 12);
        assert.strictEqual(view.state.selection.head, 12);

        // the head is at the end of the paragraph now, so there is
        // nothing left to handle for the plugin
        const handledAgain = handleKey(
          keyDown('ArrowDown', { shiftKey: true }),
        );
        assert.false(handledAgain, 'next event is not handled');
        assert.strictEqual(view.state.selection.head, 12);
      });

      test('Shift-ArrowUp after a link at the start of a paragraph moves the head to the start of the paragraph', function (assert) {
        const { view, handleKey } = setup(docWithLinkAtStart, 7);
        const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 1);
        assert.strictEqual(view.state.selection.to, 7);
        assert.strictEqual(view.state.selection.head, 1);
      });

      test('caret between two consecutive links: Shift-ArrowDown selects the second link', function (assert) {
        const { view, handleKey } = setup(docWithConsecutiveLinks, 6);
        const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 11);
        assert.strictEqual(view.state.selection.anchor, 6);
        assert.strictEqual(view.state.selection.head, 11);
      });

      test('caret between two consecutive links: Shift-ArrowUp selects the first link', function (assert) {
        const { view, handleKey } = setup(docWithConsecutiveLinks, 6);
        const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 1);
        assert.strictEqual(view.state.selection.to, 6);
        assert.strictEqual(view.state.selection.anchor, 6);
        assert.strictEqual(view.state.selection.head, 1);
      });

      test('the inline atom is selected before falling back to the adjacent block atom', function (assert) {
        const { view, handleKey } = setup(docWithLinkThenAtom, 6);
        const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

        assert.true(handled, 'event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 12);
        assert.strictEqual(view.state.selection.head, 12);

        // the head is now after the link and the next block is the
        // rule, so the block logic selects over the rule
        const handledAgain = handleKey(
          keyDown('ArrowDown', { shiftKey: true }),
        );
        assert.true(handledAgain, 'next event is handled');
        assert.strictEqual(view.state.selection.from, 6);
        assert.strictEqual(view.state.selection.to, 15);
        assert.strictEqual(view.state.selection.head, 15);
      });

      test('Shift-ArrowUp ignores the link node after the caret', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 6);
        const handled = handleKey(keyDown('ArrowUp', { shiftKey: true }));

        assert.false(handled, 'event is not handled');
        assert.strictEqual(view.state.selection.head, 6);
      });

      test('Shift-ArrowDown ignores the link node before the caret', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 12);
        const handled = handleKey(keyDown('ArrowDown', { shiftKey: true }));

        assert.false(handled, 'event is not handled');
        assert.strictEqual(view.state.selection.head, 12);
      });

      test('vertical keys do not handle the link node without shift', function (assert) {
        const { view, handleKey } = setup(docWithLinkNode, 6);

        assert.false(
          handleKey(keyDown('ArrowDown')),
          'ArrowDown without shift',
        );
        assert.false(handleKey(keyDown('ArrowUp')), 'ArrowUp without shift');
        assert.strictEqual(view.state.selection.head, 6);
      });
    });

    test('Shift-ArrowRight selects the whole link node alongside the existing selection', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 3, 6);
      const handled = handleKey(keyDown('ArrowRight', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 3);
      assert.strictEqual(view.state.selection.to, 12);
      assert.strictEqual(view.state.selection.anchor, 3);
      assert.strictEqual(view.state.selection.head, 12);
    });

    test('Shift-ArrowLeft selects the whole link node alongside the existing selection', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 13, 12);
      const handled = handleKey(keyDown('ArrowLeft', { shiftKey: true }));

      assert.true(handled, 'event is handled');
      assert.strictEqual(view.state.selection.from, 6);
      assert.strictEqual(view.state.selection.to, 13);
      assert.strictEqual(view.state.selection.anchor, 13);
      assert.strictEqual(view.state.selection.head, 6);
    });

    test('nothing happens when the head is in the middle of text', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 4);
      const handled = handleKey(keyDown('ArrowRight', { shiftKey: true }));

      assert.false(handled, 'event is not handled');
      assert.strictEqual(view.state.selection.head, 4);
    });

    test('nothing happens when there is no node next to the head', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 17);
      const handled = handleKey(keyDown('ArrowRight', { shiftKey: true }));

      assert.false(handled, 'event is not handled');
      assert.strictEqual(view.state.selection.head, 17);
    });

    test('nothing happens for the link node when shift is not used', function (assert) {
      const { view, handleKey } = setup(docWithLinkNode, 6);
      const handled = handleKey(keyDown('ArrowRight'));

      assert.false(handled, 'event is not handled');
      assert.strictEqual(view.state.selection.head, 6);
    });
  });
});
