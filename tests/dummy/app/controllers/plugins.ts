import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import {
  ProseController,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Plugin } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import {
  em,
  link,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/marks';
import {
  block_rdfa,
  blockquote,
  bullet_list,
  code_block,
  doc,
  hard_break,
  heading,
  horizontal_rule,
  image,
  inline_rdfa,
  list_item,
  ordered_list,
  paragraph,
  placeholder,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { code, codeMarkButton } from 'dummy/dummy-plugins/code-mark-plugin';
import { highlight } from 'dummy/dummy-plugins/highlight-plugin';
import {
  card,
  cardView,
  counter,
  counterView,
  dropdown,
  dropdownView,
  insertDummyComponentsWidget,
} from 'dummy/dummy-plugins/inline-components-plugin';
import { NodeViewConstructor } from 'prosemirror-view';
import applyDevTools from 'prosemirror-dev-tools';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';

const nodes = {
  doc,
  paragraph,

  repaired_block,

  list_item,
  ordered_list,
  bullet_list,
  placeholder,
  ...tableNodes({ tableGroup: 'block', cellContent: 'inline*' }),
  heading,
  blockquote,

  horizontal_rule,
  code_block,

  text,

  image,

  hard_break,
  invisible_rdfa,
  block_rdfa,
  card,
  counter,
  dropdown,
};
const marks = {
  inline_rdfa,
  code,
  link,
  em,
  strong,
  underline,
  strikethrough,
};
const dummySchema = new Schema({ nodes, marks });

export default class IndexController extends Controller {
  @tracked rdfaEditor?: ProseController;
  @tracked nodeViews: (
    proseController: ProseController
  ) => Record<string, NodeViewConstructor> = (proseController) => {
    return {
      card: cardView(proseController),
      counter: counterView(proseController),
      dropdown: dropdownView(proseController),
    };
  };
  @tracked plugins: Plugin[] = [
    // placeholderEditing(),
    highlight({ testKey: 'yeet' }),
    tablePlugin,
    tableKeymap,
  ];
  @tracked widgets: WidgetSpec[] = [
    insertDummyComponentsWidget,
    codeMarkButton,
    tableMenu,
  ];
  schema: Schema = dummySchema;

  @action
  rdfaEditorInit(rdfaEditor: ProseController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    applyDevTools(rdfaEditor.getView());
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
