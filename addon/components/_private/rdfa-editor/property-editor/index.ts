import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { tracked } from '@glimmer/tracking';
import PropertyEditorModal from './modal';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import type {
  OutgoingTriple,
  PlainTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { isLinkToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const PlusIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/plus')
      .PlusIcon
  : 'plus';
const PencilIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/pencil')
      .PencilIcon
  : 'pencil';
const BinIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/bin').BinIcon
  : 'bin';
const ThreeDotsIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/three-dots')
      .ThreeDotsIcon
  : 'three-dots';

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
