import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq, or } from 'ember-truth-helpers';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import { isLinkToNode } from '#root/utils/rdfa-utils.ts';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
import { type StatusMessage } from './types.ts';
import type SayController from '#root/core/say-controller.ts';
import { selectNodeByRdfaId } from '#root/commands/_private/rdfa-commands/select-node-by-rdfa-id.ts';
import { selectNodeBySubject } from '#root/commands/_private/rdfa-commands/select-node-by-subject.ts';

interface Sig {
  Args: {
    prop: OutgoingTriple;
    controller?: SayController;
    setStatusMessage?: (message: StatusMessage | null) => void;
  };
}

export default class PropertyDetails extends Component<Sig> {
  hasDataType = (obj: OutgoingTriple['object']) => {
    return 'datatype' in obj;
  };
  hasLanguage = (obj: OutgoingTriple['object']) => {
    return 'language' in obj;
  };
  goToOutgoing = (outgoing: OutgoingTriple) => {
    this.args.setStatusMessage?.(null);
    if (!isLinkToNode(outgoing)) {
      return;
    }
    const { object } = outgoing;
    if (!this.args.controller) {
      this.args.setStatusMessage?.({
        message: 'No editor controller found. This is probably a bug.',
        type: 'error',
      });
      return;
    }
    if (object.termType === 'LiteralNode') {
      const result = this.args.controller.doCommand(
        selectNodeByRdfaId({ rdfaId: object.value }),
        { view: this.args.controller.mainEditorView },
      );
      if (!result) {
        this.args.setStatusMessage?.({
          message: `No literal node found for id ${object.value}.`,
          type: 'error',
        });
      }
    } else {
      const result = this.args.controller.doCommand(
        selectNodeBySubject({ subject: object.value }),
        { view: this.args.controller.mainEditorView },
      );
      if (!result) {
        this.args.setStatusMessage?.({
          message: `No resource node found for ${object.value}.`,
          type: 'info',
        });
      }
    }
    this.args.controller.focus();
  };

  <template>
    <div class="au-u-padding-tiny">
      <p><strong>predicate:</strong> {{@prop.predicate}}</p>
      {{#if (this.hasDataType @prop.object)}}
        <p><strong>datatype:</strong>
          {{@prop.object.datatype.value}}</p>
      {{/if}}
      {{#if (this.hasLanguage @prop.object)}}
        <p><strong>language:</strong> {{@prop.object.language}}</p>
      {{/if}}
      {{#if (eq @prop.object.termType "ContentLiteral")}}
        <AuPill>content-predicate</AuPill>
      {{else if
        (or
          (eq @prop.object.termType "LiteralNode")
          (eq @prop.object.termType "ResourceNode")
        )
      }}
        <AuButton
          class="au-u-padding-left-none au-u-padding-right-none"
          @icon={{ExternalLinkIcon}}
          @skin="link"
          title={{@prop.object.value}}
          {{on "click" (fn this.goToOutgoing @prop)}}
        >value</AuButton>
      {{else}}
        <p><strong>value:</strong> {{@prop.object.value}}</p>
      {{/if}}
    </div>
  </template>
}
