import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Schema } from '@lblod/ember-rdfa-editor';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/editor';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import ResponsiveToolbar from '@lblod/ember-rdfa-editor/components/responsive-toolbar';
import Undo from '@lblod/ember-rdfa-editor/components/plugins/history/undo';
import Redo from '@lblod/ember-rdfa-editor/components/plugins/history/redo';
import Bold from '@lblod/ember-rdfa-editor/components/plugins/text-style/bold';
import Italic from '@lblod/ember-rdfa-editor/components/plugins/text-style/italic';
import Strikethrough from '@lblod/ember-rdfa-editor/components/plugins/text-style/strikethrough';
import Underline from '@lblod/ember-rdfa-editor/components/plugins/text-style/underline';
import TableMenu from '@lblod/ember-rdfa-editor/components/plugins/table/table-menu';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  paragraph,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  inlineRdfaWithConfig,
  inlineRdfaWithConfigView,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import {
  em,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';

export default class Editor extends Component<void> {
  @tracked controller?: SayController;

  get schema() {
    // A prosemirror schema which determines how documents are parsed and written to the DOM.
    return new Schema({
      nodes: {
        doc: docWithConfig({
          defaultLanguage: 'nl-BE',
        }),
        paragraph,
        ...tableNodes({
          tableGroup: 'block',
          cellContent: 'block+',
        }),
        heading: headingWithConfig(),
        blockquote,
        horizontal_rule,
        code_block,
        text,
        hard_break,
        block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
        inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
      },
      marks: {
        em,
        strikethrough,
        strong,
        underline
      }
    });
  }

  get nodeViews() {
    return (controller: SayController) => ({
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
    });
  }

  get editorOptions() {
    return {
      showPaper: true,
      showSidebarLeft: false,
      showSidebarRight: false,
    };
  }

  get plugins() {
    // A list of prosemirror plugins you want to enable. More information about prosemirror plugins can be found on https://prosemirror.net/docs/guide/#state.plugins.
    return [...tablePlugins, tableKeymap];
  }

  editorInit = (controller: SayController) => {
    this.controller = controller;
    // This method may contain code that runs when the editor has just loaded. It can be useful to e.g. load a document into the editor.
  }

  <template>
    <EditorContainer
      @editorOptions={{this.editorOptions}}
      @controller={{this.controller}}
    >
      <:toolbar as |container|>
        <ResponsiveToolbar>
          <:main as |Toolbar|>
            <Toolbar.Group>
              <Undo @controller={{container.controller}}/>
              <Redo @controller={{container.controller}}/>
            </Toolbar.Group>
            <Toolbar.Group>
              <Bold @controller={{container.controller}}/>
              <Italic @controller={{container.controller}}/>
              <Strikethrough @controller={{container.controller}}/>
              <Underline @controller={{container.controller}}/>
            </Toolbar.Group>
            <Toolbar.Group>
              <TableMenu @controller={{container.controller}}/>
            </Toolbar.Group>
          </:main>
        </ResponsiveToolbar>
      </:toolbar>
      <:default>
        <RdfaEditor
          @rdfaEditorInit={{this.editorInit}}
          @schema={{this.schema}}
          @plugins={{this.plugins}}
        />
      </:default>
    </EditorContainer>
  </template>
}
