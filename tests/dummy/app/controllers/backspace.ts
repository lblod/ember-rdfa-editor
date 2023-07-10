import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { Schema } from 'prosemirror-model';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  block_rdfa,
  docWithConfig,
  hard_break,
  horizontal_rule,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import applyDevTools from 'prosemirror-dev-tools';
import { code } from '@lblod/ember-rdfa-editor/plugins/code/marks/code';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/invisible-rdfa';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image, imageView } from '@lblod/ember-rdfa-editor/plugins/image';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
  space,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list/input_rules';
import { inputRules, PluginConfig } from '@lblod/ember-rdfa-editor';
import { KeymapOptions } from '@lblod/ember-rdfa-editor/core/keymap';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import { getOwner } from '@ember/application';

export default class BackspaceController extends Controller {
  @tracked rdfaEditor?: SayController;

  keyMapOptions: KeymapOptions = {
    backspace: {
      selectBlockRdfaNode: true,
    },
  };

  @service declare intl: IntlService;
  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        defaultLanguage: 'nl-BE',
      }),
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
      block_rdfa: {
        ...block_rdfa,
        isolating: true,
        selectable: true,
      },
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
      highlight,
      color,
    },
  });

  get linkOptions() {
    return {
      interactive: true,
    };
  }

  @tracked plugins: PluginConfig = [
    // disabled until https://binnenland.atlassian.net/browse/GN-4147 is fixed
    firefoxCursorFix(),
    lastKeyPressedPlugin,
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    createInvisiblesPlugin(
      [space, hardBreak, paragraphInvisible, headingInvisible],
      {
        shouldShowInvisibles: false,
      }
    ),
    inputRules({
      rules: [
        bullet_list_input_rule(this.schema.nodes.bullet_list),
        ordered_list_input_rule(this.schema.nodes.ordered_list),
      ],
    }),
    emberApplication({ application: getOwner(this) }),
  ];
  @tracked nodeViews = (controller: SayController) => {
    return {
      link: linkView(this.linkOptions)(controller),
      image: imageView(controller),
    };
  };

  get showRdfaBlocks() {
    return this.rdfaEditor?.showRdfaBlocks;
  }

  @action
  rdfaEditorInit(rdfaEditor: SayController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.initialize(presetContent);
    applyDevTools(rdfaEditor.mainEditorView);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
