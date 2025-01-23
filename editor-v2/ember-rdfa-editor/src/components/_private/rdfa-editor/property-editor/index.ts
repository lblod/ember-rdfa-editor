import Component from '@glimmer/component';
import { SayController } from '#root';
import { unwrap } from '#root/utils/_private/option.ts';
import { tracked } from '@glimmer/tracking';
import PropertyEditorModal from './modal.gts';
import { addProperty, removeProperty } from '#root/commands/index.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';
import type {
  OutgoingTriple,
  PlainTriple,
} from '#root/core/rdfa-processor.ts';
import { isLinkToNode } from '#root/utils/rdfa-utils.ts';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';

type CreationStatus = {
  mode: 'creation';
};
type UpdateStatus = {
  mode: 'update';
  index: number;
  property: PlainTriple;
};
type Status = CreationStatus | UpdateStatus;
type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};
export default class RdfaPropertyEditor extends Component<Args> {
  Modal = PropertyEditorModal;
  PlusIcon = PlusIcon;
  PencilIcon = PencilIcon;
  BinIcon = BinIcon;
  ThreeDotsIcon = ThreeDotsIcon;

  @tracked status?: Status;
  isPlainTriple = (triple: OutgoingTriple) => !isLinkToNode(triple);

  get properties() {
    return this.args.node.value.attrs['properties'] as
      | OutgoingTriple[]
      | undefined;
  }

  get hasAttributeProperties() {
    return this.properties?.some((prop) => !isLinkToNode(prop));
  }

  get isCreating() {
    return this.status?.mode === 'creation';
  }

  get isUpdating() {
    return this.status?.mode === 'update';
  }

  get currentResource() {
    return this.args.node.value.attrs['subject'] as string;
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
      property: this.properties?.[index] as PlainTriple,
    };
  };

  addProperty = (property: PlainTriple) => {
    this.args.controller?.doCommand(
      addProperty({
        resource: this.currentResource,
        property,
      }),
      { view: this.args.controller.mainEditorView },
    );
    this.status = undefined;
  };

  updateProperty = (newProperty: PlainTriple) => {
    const { index } = this.status as UpdateStatus;
    const newProperties = unwrap(this.properties).slice();
    newProperties[index] = newProperty;
    this.updatePropertiesAttribute(newProperties);
    this.status = undefined;
  };

  removeProperty = (index: number) => {
    this.args.controller?.doCommand(
      removeProperty({ resource: this.currentResource, index }),
      { view: this.args.controller.mainEditorView },
    );
  };

  updatePropertiesAttribute = (newProperties: OutgoingTriple[]) => {
    this.args.controller?.withTransaction(
      (tr) => {
        return TransformUtils.setAttribute(
          tr,
          this.args.node.pos,
          'properties',
          newProperties,
        );
      },
      { view: this.args.controller.mainEditorView },
    );
  };

  cancel = () => {
    this.status = undefined;
  };
}
