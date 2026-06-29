import type SayController from '#root/core/say-controller.ts';
import { turtle } from 'codemirror-lang-turtle';
import { knownledgeBaseKey } from '#root/plugins/knowledgebase/knowledgebase-plugin.ts';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import Component from '@glimmer/component';

import { basicSetup } from 'codemirror';
import codemirror from '../../modifiers/_private/code-mirror.ts';
import type { KnowledgeBase } from '#root/core/rdfa/knowledge-base.ts';
import N3 from 'n3';
import { SayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import { isSayId } from '#root/core/rdfa/say-id.ts';
import { findNodeByRdfaId } from '#root/utils/rdfa-utils.ts';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';
import type { Quad } from '@rdfjs/types';
import type { PNode } from '#root/prosemirror-aliases.ts';
import { HeadlessForm } from 'ember-headless-form';
import { TrackedObject } from 'tracked-built-ins';
import type { Extension } from '@codemirror/state';

type Sig = {
  Args: {
    controller: SayController;
  };
};
const df = new SayDataFactory();
function kbToTtl(doc: PNode, kb: KnowledgeBase): string {
  const writer = new N3.Writer(); // Create a writer which uses `c` as a prefix for the namespace `http://example.org/cartoons#`
  for (const quad of [...kb]) {
    if (isSayId(quad.object.value)) {
      writer.addQuad(
        quad.subject,
        quad.predicate,
        df.literal(
          findNodeByRdfaId(doc, quad.object.value)?.value.textContent ?? '',
        ),
      );
    } else {
      writer.addQuad(quad);
    }
  }
  let rslt!: string;
  writer.end((error, result: string) => {
    rslt = result;
  });
  return rslt;
}
export class RdfaVisualizer extends Component<Sig> {
  get foo() {
    return 'foo';
  }
  get kb() {
    return knownledgeBaseKey.getState(this.args.controller.mainEditorState)
      ?.knowledgeBase;
  }
  get content() {
    if (this.kb) {
      return kbToTtl(this.args.controller.mainEditorState.doc, this.kb);
    } else {
      return '';
    }
  }
  get groupedBySubject(): { subject: string; quads: Quad[] }[] {
    if (!this.kb) {
      return [];
    }
    const groups = [];
    const subjects = new Set<string>([...this.kb].map((q) => q.subject.value));
    for (const subject of subjects) {
      groups.push({
        subject,
        quads: [...this.kb.match(df.namedNode(subject))],
      });
    }
    return groups;
  }
  get subjectGroups() {
    return this.groupedBySubject.entries();
  }
  get doc() {
    return this.args.controller.mainEditorState.doc;
  }
  onTripleUpdate = (oldQuad: Quad, newQuad: Quad) => {
    if (isSayId(oldQuad.object.value)) {
      const { pos, value } = findNodeByRdfaId(this.doc, oldQuad.object.value)!;

      this.args.controller.withTransaction((tr) =>
        tr.replaceRangeWith(
          pos + 1,
          pos + value.nodeSize - 1,
          this.args.controller.schema.text(
            newQuad.object.value.length ? newQuad.object.value : ' ',
          ),
        ),
      );
    } else {
    }
  };
  get cmExtensions(): Extension[] {
    return [basicSetup, turtle()];
  }
  <template>
    <div style="max-height: 40%; overflow: scroll;">
      {{#each this.groupedBySubject as |group|}}
        <SubjectItem
          @controller={{@controller}}
          @subject={{group.subject}}
          @quads={{group.quads}}
          @onChange={{this.onTripleUpdate}}
        />
      {{/each}}
    </div>
    <div
      {{codemirror content=this.content extensions=this.cmExtensions}}
      style="width: 100%"
    ></div>
  </template>
}

type SubjectItemSig = {
  Args: {
    controller: SayController;
    subject: string;
    quads: Quad[];
    onChange: (oldQuad: Quad, newQuad: Quad) => void;
  };
};
export class SubjectItem extends Component<SubjectItemSig> {
  get quads() {
    return this.args.quads;
  }
  <template>
    <b>{{this.args.subject}}</b>
    {{#each this.quads as |quad|}}
      <TripleItem
        @controller={{@controller}}
        @quad={{quad}}
        @onChange={{@onChange}}
      />
    {{/each}}
  </template>
}

type TripleItemSig = {
  Args: {
    controller: SayController;
    quad: Quad;
    onChange: (oldQuad: Quad, newQuad: Quad) => void;
  };
};
export class TripleItem extends Component<TripleItemSig> {
  get quad() {
    return this.args.quad;
  }
  get predicate() {
    return this.quad.predicate.value;
  }
  get doc() {
    return this.args.controller.mainEditorState.doc;
  }
  get object() {
    if (isSayId(this.quad.object.value)) {
      return {
        type: 'textarea',
        value:
          findNodeByRdfaId(this.doc, this.quad.object.value)?.value
            .textContent ?? '',
      };
    } else {
      return { type: 'input', value: this.args.quad.object.value };
    }
  }
  get isTextArea() {
    return this.object.type === 'textarea';
  }
  updateValue = (data: { val: string }) => {
    const oldQuad = this.quad;
    const newQuad = df.quad(
      oldQuad.subject,
      oldQuad.predicate,
      df.literal(data.val),
    );
    // @ts-expect-error aaah
    this.args.onChange(oldQuad, newQuad);
  };
  initialData = { val: this.object.value };

  data = new TrackedObject(this.initialData);

  setNewVal = (e: InputEvent) => {
    this.data.val = (e.target as HTMLTextAreaElement).value;
  };

  <template>
    <div>

      <WithUniqueId as |formId|>
        <HeadlessForm
          id={{formId}}
          @data={{this.data}}
          @dataMode="mutable"
          @onSubmit={{this.updateValue}}
          class="au-o-flow--small"
          as |form|
        >
          <input value={{this.predicate}} />
          <form.Field @name="val" as |field|>
            <textarea
              id={{field.id}}
              value={{field.value}}
              {{on "input" this.setNewVal}}
            />
          </form.Field>
          <AuButton form={{formId}} type="submit">Insert</AuButton>
        </HeadlessForm>
      </WithUniqueId>
    </div>
  </template>
}
