import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { tracked } from '@glimmer/tracking';
import PropertyEditorModal from './modal';
import { removeProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands';
import { addProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands/add-property';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  AttributeProperty,
  Property,
} from '@lblod/ember-rdfa-editor/core/say-parser';

type CreationStatus = {
  mode: 'creation';
};
type UpdateStatus = {
  mode: 'update';
  index: number;
  property: AttributeProperty;
};
type Status = CreationStatus | UpdateStatus;
type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};
export default class RdfaPropertyEditor extends Component<Args> {
  Modal = PropertyEditorModal;

  @tracked status?: Status;

  get properties() {
    return this.args.node.value.attrs.properties as Property[] | undefined;
  }

  get hasAttributeProperties() {
    return this.properties?.some((prop) => prop.type === 'attribute');
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
      property: this.properties?.[index] as AttributeProperty,
    };
  };

  addProperty = (property: AttributeProperty) => {
    this.args.controller?.doCommand(
      addProperty({
        position: this.args.node.pos,
        property,
      }),
    );
    this.status = undefined;
  };

  updateProperty = (newProperty: AttributeProperty) => {
    const { index } = this.status as UpdateStatus;
    const newProperties = unwrap(this.properties).slice();
    newProperties[index] = newProperty;
    this.updatePropertiesAttribute(newProperties);
    this.status = undefined;
  };

  removeProperty = (index: number) => {
    this.args.controller?.doCommand(
      removeProperty({ position: this.args.node.pos, index }),
    );
  };

  updatePropertiesAttribute = (newProperties: Property[]) => {
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
