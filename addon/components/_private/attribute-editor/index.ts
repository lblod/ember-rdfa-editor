import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { Changeset, EmberChangeset } from 'ember-changeset';
import { trackedReset } from 'tracked-toolbox';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';

type Args = {
  controller: SayController;
  node: ResolvedPNode;
};

export default class AttributeEditor extends Component<Args> {
  CheckIcon = CheckIcon;
  PencilIcon = PencilIcon;
  ChevronDownIcon = ChevronDownIcon;
  ChevronUpIcon = ChevronUpIcon;

  @tracked collapsed = false;
  @trackedReset<AttributeEditor, boolean>({
    memo: 'node',
    update: (component) => {
      component.changeset = undefined;
      return false;
    },
  })
  isEditing = false;

  @tracked changeset?: EmberChangeset;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get nodespec() {
    return this.node.value.type.spec as SayNodeSpec;
  }

  toggleSection = () => {
    this.collapsed = !this.collapsed;
  };

  isEditable = (attr: string) => {
    //@ts-expect-error editable is not defined on attribute-spec type
    return this.node.value.type.spec.attrs[attr].editable as
      | boolean
      | undefined;
  };

  enableEditingMode = () => {
    this.changeset = Changeset(this.node.value.attrs);
    this.isEditing = true;
  };

  cancelEditing = () => {
    this.isEditing = false;
    this.changeset = undefined;
  };

  saveChanges = () => {
    this.controller?.withTransaction((tr) => {
      for (const { key, value } of unwrap(this.changeset).changes) {
        TransformUtils.setAttribute(tr, this.node.pos, key, value);
      }
      return tr;
    });
    this.isEditing = false;
    this.changeset = undefined;
  };

  updateChangeset = (attr: string, event: InputEvent) => {
    if (this.changeset) {
      this.changeset[attr] = (event.target as HTMLTextAreaElement).value;
    }
  };

  formatValue = (value: unknown) => {
    return JSON.stringify(value, null, 2);
  };

  editorComponent = (attr: string) => {
    return this.nodespec?.attrs?.[attr].editor;
  };
}
