/**
 *
 * Based on the footnotes example from https://github.com/ProseMirror/website
 *
 * Copyright (C) 2015-2017 by Marijn Haverbeke <marijnh@gmail.com> and others
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import {
  AttrStep,
  type Command,
  EditorState,
  keymap,
  NodeSelection,
  type NodeViewConstructor,
  SayView,
  Selection,
  Step,
  StepMap,
  TextSelection,
  Transaction,
} from '#root';
import type { EmberNodeArgs } from '#root/utils/ember-node';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuid } from 'uuid';
import { redo, undo } from '#root/plugins/history';
import { isSome, unwrap } from '#root/utils/_private/option';
import { lastKeyPressedPluginKey } from '#root/plugins/last-key-pressed';
import { Plugin } from 'prosemirror-state';
import { embeddedEditorBaseKeymap } from '#root/core/keymap';

type Args = EmberNodeArgs & {
  placeholder: string;
  initEditor?: (view: SayView) => void;
  /* override the keymap. */
  keymap?: { [key: string]: Command };
  /* editor plugins to add */
  plugins?: Plugin[];
  nodeViews?: {
    [node: string]: NodeViewConstructor;
  };
  onSelected?: (selected: boolean, innerState: EditorState) => void;
};

/**
 * An embedded editor to use for *inline* content. This way you can specify extra content for an
 * inline (atom) node. For block content, use content directly instead ({{yield}} in ember-nodes).
 */
export default class EmbeddedEditor extends Component<Args> {
  @service declare intl: IntlService;
  innerView: SayView | null = null;

  contentWrapper: Element | null = null;

  editorId = uuid();

  get outerView() {
    return this.args.view;
  }

  get node() {
    return this.args.node;
  }

  get schema() {
    return this.controller.schema;
  }

  get pos() {
    return this.args.getPos();
  }

  get controller() {
    return this.args.controller;
  }

  get plugins() {
    return this.args.plugins || [];
  }

  get keymap() {
    const undoRedoMap = {
      'Mod-z': () =>
        undo(this.outerView.state, this.outerView.dispatch.bind(this)),
      'Mod-Z': () =>
        undo(this.outerView.state, this.outerView.dispatch.bind(this)),
      'Mod-y': () =>
        redo(this.outerView.state, this.outerView.dispatch.bind(this)),
      'Mod-Y': () =>
        redo(this.outerView.state, this.outerView.dispatch.bind(this)),
    };

    if (this.args.keymap) {
      return {
        ...this.args.keymap,
        ...undoRedoMap,
      };
    } else {
      return { ...embeddedEditorBaseKeymap(this.schema), ...undoRedoMap };
    }
  }

  get nodeViews() {
    return this.outerView.props.nodeViews;
  }

  @action
  didInsertContentWrapper(target: Element) {
    this.contentWrapper = target;
    this.innerView = new SayView(
      this.contentWrapper,
      {
        decorations: () => this.args.contentDecorations,
        state: EditorState.create({
          doc: this.node,
          plugins: [keymap(this.keymap), ...this.plugins],
          // the schema is derived from 'doc' key and can't be customized
        }),
        attributes: {
          ...(this.args.placeholder && {
            'data-placeholder': this.args.placeholder,
          }),
        },
        dispatchTransaction: this.dispatchInner,
        handleDOMEvents: {
          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.

            if (this.outerView.hasFocus()) this.innerView?.focus();
          },
          focus: () => {
            const pos = this.pos;
            if (pos !== undefined) {
              const outerSelectionTr = this.outerView.state.tr;
              const outerSelection = new NodeSelection(
                this.outerView.state.doc.resolve(pos),
              );
              outerSelectionTr.setSelection(outerSelection);
              this.outerView.dispatch(outerSelectionTr);
            }

            if (this.innerView) {
              this.args.controller.setActiveView(this.innerView);
            }
          },
        },
        // These handlers are needed to fix part of a bug in Gecko (firefox): https://bugzilla.mozilla.org/show_bug.cgi?id=1612076
        handleKeyDown: ({ state: { selection, doc } }, event) => {
          if (selection.empty) {
            if (selection.from === 0) {
              // At the start of the embedded editor
              if (event.code === 'ArrowLeft' || event.code === 'Backspace') {
                this.outerView.focus();
              }
              if (event.code === 'Backspace' && doc.content.size !== 0) {
                // Prevent the deletion of the node as there is still content
                event.preventDefault();
                this.selectOutside('before');
              }
            }
            if (selection.from === doc.nodeSize - 2) {
              // At the end of the embedded editor
              if (event.code === 'ArrowRight' || event.code === 'Delete') {
                this.outerView.focus();
              }
              if (event.code === 'Delete' && doc.content.size !== 0) {
                // Prevent the deletion of the node as there is still content
                event.preventDefault();
                this.selectOutside('after');
              }
            }
          }
        },
        nodeViews: this.nodeViews,
      },
      this.outerView,
    );
    if (this.args.initEditor) {
      this.args.initEditor(this.innerView);
    }
  }

  @action
  onSelected(_: unknown, sel: [boolean]) {
    if (this.args.onSelected && this.innerView) {
      this.args.onSelected(sel[0], this.innerView.state);
    }
    if (this.args.selected && this.innerView) {
      const lastKeyPressedPluginState = lastKeyPressedPluginKey.getState(
        this.controller.mainEditorState,
      );

      const lastKeyPressed = lastKeyPressedPluginState?.lastKeyPressed;
      if (!this.innerView.hasFocus()) {
        this.innerView.dispatch(
          this.innerView.state.tr.setSelection(
            Selection[
              ['ArrowLeft', 'Backspace'].includes(lastKeyPressed ?? '')
                ? 'atEnd'
                : 'atStart'
            ](this.innerView.state.doc),
          ),
        );

        this.innerView.focus();
      }
    } else if (this.innerView) {
      const state = this.innerView.state;
      // De-select the inner node if we're no longer selected
      this.dispatchInner(
        state.tr.setSelection(TextSelection.create(state.doc, 0, 0)),
      );
    }
  }

  @action
  onNodeUpdate() {
    if (this.innerView) {
      const state = this.innerView.state;
      const start = this.node.content.findDiffStart(state.doc.content);
      const end = this.node.content.findDiffEnd(state.doc.content);
      const tr = state.tr;
      let trChanged = false;
      if (isSome(start) && isSome(end)) {
        let { a: endA, b: endB } = end;
        const overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        tr.replace(start, endB, this.node.slice(start, endA)).setMeta(
          'fromOutside',
          this.editorId,
        );
        trChanged = true;
      }
      // check if our top node has new attributes, and update the state
      // if so
      if (!this.node.hasMarkup(state.doc.type, state.doc.attrs)) {
        for (const [key, val] of Object.entries(this.node.attrs)) {
          tr.setDocAttribute(key, val);
        }

        tr.setMeta('fromOutside', this.editorId);
        trChanged = true;
      }
      if (trChanged) {
        this.innerView.dispatch(tr);
      }
    }
  }

  @action
  onDecorationsUpdate() {
    this.innerView?.dispatch(this.innerView.state.tr);
  }

  selectOutside(side: 'before' | 'after') {
    const selectionSide = side === 'after' ? '$head' : '$anchor';
    const outerState = this.outerView.state;
    this.outerView.dispatch(
      outerState.tr.setSelection(
        TextSelection.create(
          outerState.doc,
          outerState.selection[selectionSide].pos,
        ),
      ),
    );
  }

  dispatchInner = (tr: Transaction) => {
    const pos = this.pos;
    if (this.innerView && pos !== undefined) {
      const { state, transactions } = this.innerView.state.applyTransaction(tr);
      this.innerView.updateState(state);
      if (tr.getMeta('fromOutside') !== this.editorId) {
        const outerTr = this.outerView.state.tr,
          offsetMap = StepMap.offset(pos + 1);
        for (let i = 0; i < transactions.length; i++) {
          const steps = transactions[i].steps;
          for (let j = 0; j < steps.length; j++) {
            const step = steps[j];
            let mappedStep: Step;
            if (step instanceof AttrStep) {
              const mappedPos = offsetMap.mapResult(step.pos, 1);
              if (mappedPos.deleted) {
                throw new Error('Mapped position has been deleted');
              }
              mappedStep = new AttrStep(mappedPos.pos, step.attr, step.value);
            } else {
              mappedStep = unwrap(step.map(offsetMap));
            }
            outerTr.step(mappedStep);
          }
        }
        if (outerTr.docChanged) this.outerView.dispatch(outerTr);
      }
    }
  };

  willDestroy(): void {
    super.willDestroy();
    this.innerView?.destroy();
    this.innerView = null;
  }
}
