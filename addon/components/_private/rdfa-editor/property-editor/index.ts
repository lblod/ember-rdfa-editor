import Component from '@glimmer/component';
import {
  OutgoingAttrProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { SayController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { tracked } from '@glimmer/tracking';
import PropertyEditorModal from './modal';
import { removeProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands';

type CreationStatus = {
  mode: 'creation';
};
type UpdateStatus = {
  mode: 'update';
  index: number;
  property: OutgoingAttrProp;
};
type Status = CreationStatus | UpdateStatus;
type Args = {
  controller?: SayController;
  node: ResolvedNode;
};
export default class RdfaPropertyEditor extends Component<Args> {
  Modal = PropertyEditorModal;

  @tracked status?: Status;

  get properties() {
    return this.args.node.value.attrs.properties as OutgoingProp[] | undefined;
  }

  get hasAttributeProperties() {
    return this.properties?.some((prop) => prop.type === 'attr');
  }

  get isCreating() {
    return this.status?.mode === 'creation';
  }

  get isUpdating() {
    return this.status?.mode === 'update';
  }

  startPropertyCreation = () => {
    this.status = {
      mode: 'creation',
    };
  };

  startPropertyUpdate = (index: number) => {
    this.status = {
      mode: 'update',
      index,
      property: this.properties?.[index] as OutgoingAttrProp,
    };
  };

  addProperty = (predicate: string, object: string) => {
    const newProperties = this.properties ? [...this.properties] : [];
    newProperties.push({ type: 'attr', predicate: predicate, object });
    this.updatePropertiesAttribute(newProperties);
    this.status = undefined;
  };

  updateProperty = (predicate: string, object: string) => {
    const { index } = this.status as UpdateStatus;
    const newProperties = unwrap(this.properties).slice();
    newProperties[index] = { type: 'attr', predicate, object };
    this.updatePropertiesAttribute(newProperties);
    this.status = undefined;
  };

  removeProperty = (index: number) => {
    this.args.controller?.doCommand(
      removeProperty({ position: this.args.node.pos, index }),
    );
  };

  updatePropertiesAttribute = (newProperties: OutgoingProp[]) => {
    this.args.controller?.withTransaction((tr) => {
      return tr.setNodeAttribute(
        this.args.node.pos,
        'properties',
        newProperties,
      );
    });
  };

  cancel = () => {
    this.status = undefined;
  };
}
