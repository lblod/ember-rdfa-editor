import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Plugin } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
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
  tableNodes,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { tableKeymap, tablePlugin } from '@lblod/ember-rdfa-editor/plugins';
import applyDevTools from 'prosemirror-dev-tools';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { code } from '../dummy-marks/code';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class IndexController extends Controller {
  @tracked rdfaEditor?: ProseController;
  @service declare intl: IntlService;

  get linkOptions() {
    return {
      interactive: true,
    };
  }

  @tracked plugins: Plugin[] = [tablePlugin, tableKeymap];
  @tracked nodeViews = (controller: ProseController) => {
    return {
      link: linkView(this.linkOptions)(controller),
    };
  };

  get schema() {
    return new Schema({
      nodes: {
        doc,
        paragraph,

        repaired_block,

        list_item,
        ordered_list,
        bullet_list,
        placeholder,
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        heading,
        blockquote,

        horizontal_rule,
        code_block,

        text,

        image,

        hard_break,
        invisible_rdfa,
        block_rdfa,
        link: link(this.linkOptions),
      },
      marks: {
        inline_rdfa,
        code,
        em,
        strong,
        underline,
        strikethrough,
        subscript,
        superscript,
      },
    });
  }

  @action
  rdfaEditorInit(rdfaEditor: ProseController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    applyDevTools(rdfaEditor.view);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
