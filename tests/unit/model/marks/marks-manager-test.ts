import MarksManager from '@lblod/ember-rdfa-editor/core/model/marks/marks-manager';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';

import { module, test } from 'qunit';

module('Unit | model | marks-manager-test | getMarksByOwner', function () {
  test('one mark instance', function (assert) {
    const {
      root: initial,
      textNodes: { text },
    } = vdom`
        <div>
          <text __id="text" __marks="bold">abc</text>
        </div>`;

    const manager = MarksManager.fromDocument(initial as ModelElement);
    const marksByOwner = manager.getMarksByOwner(CORE_OWNER);
    const markInstances = [...marksByOwner.values()];
    assert.strictEqual(markInstances.length, 1);
    assert.strictEqual(markInstances[0].mark.name, 'bold');
    assert.strictEqual(markInstances[0].node, text);
  });
  test('multiple mark instances', function (assert) {
    const {
      root: initial,
      textNodes: { text1, text2, text3 },
    } = vdom`
        <div>
          <text __id="text1" __marks="bold">abc</text>
          <text __id="text2" __marks="bold">def</text>
          <span>
            <text __id="text3" __marks="bold">def</text>
          </span>
        </div>`;

    const manager = MarksManager.fromDocument(initial as ModelElement);
    const marksByOwner = manager.getMarksByOwner(CORE_OWNER);
    const markInstances = [...marksByOwner.values()];
    assert.strictEqual(markInstances.length, 3);
    assert.true(
      ArrayUtils.all(markInstances, (entry) => entry.mark.name === 'bold')
    );
    assert.strictEqual(markInstances[0].node, text1);
    assert.strictEqual(markInstances[1].node, text2);
    assert.strictEqual(markInstances[2].node, text3);
  });
  test('multiple mark types', function (assert) {
    const {
      root: initial,
      textNodes: { text1, text2, text3 },
    } = vdom`
        <div>
          <text __id="text1" __marks="bold">abc</text>
          <text __id="text2" __marks="underline">def</text>
          <span>
            <text __id="text3" __marks="italic">def</text>
          </span>
        </div>`;

    const manager = MarksManager.fromDocument(initial as ModelElement);
    const marksByOwner = manager.getMarksByOwner(CORE_OWNER);
    const markInstances = [...marksByOwner.values()];
    assert.strictEqual(markInstances.length, 3);
    assert.strictEqual(markInstances[0].mark.name, 'bold');
    assert.strictEqual(markInstances[1].mark.name, 'underline');
    assert.strictEqual(markInstances[2].mark.name, 'italic');

    assert.strictEqual(markInstances[0].node, text1);
    assert.strictEqual(markInstances[1].node, text2);
    assert.strictEqual(markInstances[2].node, text3);
  });
});

module(
  'Unit | model | marks-manager-test | getVisualMarkGroupsByMarkName',
  function () {
    test('one mark instance', function (assert) {
      const {
        root: initial,
        textNodes: { text },
      } = vdom`
        <div>
          <text __id="text" __marks="bold">abc</text>
        </div>`;

      const manager = MarksManager.fromDocument(initial as ModelElement);
      const markGroupsByMarkName =
        manager.getVisualMarkGroupsByMarkName('bold');
      assert.strictEqual(markGroupsByMarkName.length, 1);
      const markGroup = markGroupsByMarkName[0];
      assert.strictEqual(markGroup.length, 1);
      assert.strictEqual(markGroup[0].mark.name, 'bold');
      assert.strictEqual(markGroup[0].node, text);
    });
    test('multiple mark instances', function (assert) {
      const {
        root: initial,
        textNodes: { text1, text2, text3 },
      } = vdom`
        <div>
          <text __id="text1" __marks="bold">abc</text>
          <text __id="text2" __marks="bold">def</text>
          <span>
            <text __id="text3" __marks="bold">def</text>
          </span>
        </div>`;

      const manager = MarksManager.fromDocument(initial as ModelElement);
      const markGroupsByMarkName =
        manager.getVisualMarkGroupsByMarkName('bold');
      assert.strictEqual(markGroupsByMarkName.length, 2);
      const markGroup1 = markGroupsByMarkName[0];
      const markGroup2 = markGroupsByMarkName[1];
      assert.strictEqual(markGroup1.length, 2);
      assert.strictEqual(markGroup2.length, 1);
      assert.strictEqual(markGroup1[0].mark.name, 'bold');
      assert.strictEqual(markGroup1[1].mark.name, 'bold');
      assert.strictEqual(markGroup2[0].mark.name, 'bold');
      assert.strictEqual(markGroup1[0].node, text1);
      assert.strictEqual(markGroup1[1].node, text2);
      assert.strictEqual(markGroup2[0].node, text3);
    });
    test('multiple mark types', function (assert) {
      const {
        root: initial,
        textNodes: { text1, text2, text3 },
      } = vdom`
        <div>
          <text __id="text1" __marks="bold,italic">abc</text>
          <text __id="text2" __marks="underline,bold">def</text>
          <span>
            <text __id="text3" __marks="italic,underline">def</text>
          </span>
        </div>`;

      const manager = MarksManager.fromDocument(initial as ModelElement);
      const boldMarkGroups = manager.getVisualMarkGroupsByMarkName('bold');
      const italicMarkGroups = manager.getVisualMarkGroupsByMarkName('italic');
      const underlineMarkGroups =
        manager.getVisualMarkGroupsByMarkName('underline');
      assert.strictEqual(boldMarkGroups.length, 1);
      assert.strictEqual(italicMarkGroups.length, 2);
      assert.strictEqual(underlineMarkGroups.length, 2);

      assert.strictEqual(boldMarkGroups[0][0].mark.name, 'bold');
      assert.strictEqual(boldMarkGroups[0][1].mark.name, 'bold');

      assert.strictEqual(italicMarkGroups[0][0].mark.name, 'italic');
      assert.strictEqual(italicMarkGroups[1][0].mark.name, 'italic');

      assert.strictEqual(underlineMarkGroups[0][0].mark.name, 'underline');
      assert.strictEqual(underlineMarkGroups[1][0].mark.name, 'underline');

      assert.strictEqual(boldMarkGroups[0][0].node, text1);
      assert.strictEqual(boldMarkGroups[0][1].node, text2);

      assert.strictEqual(italicMarkGroups[0][0].node, text1);
      assert.strictEqual(italicMarkGroups[1][0].node, text3);

      assert.strictEqual(underlineMarkGroups[0][0].node, text2);
      assert.strictEqual(underlineMarkGroups[1][0].node, text3);
    });
  }
);
