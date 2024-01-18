import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { localCopy } from 'tracked-toolbox';
import Component from '@glimmer/component';
import type * as RDF from '@rdfjs/types';
import type { PlainTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

type Args = {
  property?: PlainTriple;
  onCancel: () => void;
  onSave: (property: PlainTriple) => void;
};

export default class PropertyEditorModal extends Component<Args> {
  @localCopy('args.property.predicate') newPredicate?: string;
  @localCopy('args.property.object.value') newObjectValue?: string;
  @localCopy('args.property.object.datatype.value') newDataType?: string;
  @localCopy('args.property.object.language') newLanguage?: string;

  typeOptions = ['Literal', 'NamedNode'];
  @tracked
  valueType: 'Literal' | 'NamedNode' = 'Literal';
  get isNew() {
    return !this.args.property;
  }

  get title() {
    if (this.isNew) {
      return 'Add property';
    } else {
      return 'Edit property';
    }
  }

  updatePredicate = (event: InputEvent) => {
    this.newPredicate = (event.target as HTMLInputElement).value;
  };

  updateObject = (event: InputEvent) => {
    this.newObjectValue = (event.target as HTMLInputElement).value;
  };

  cancel = () => {
    this.args.onCancel();
  };

  save = () => {
    if (this.newPredicate && this.newObjectValue) {
      if (this.valueType === 'Literal') {
        this.args.onSave({
          predicate: this.newPredicate,
          object: {
            termType: 'Literal',
            value: this.newObjectValue,
            language: this.newLanguage || '',
            datatype: { termType: 'NamedNode', value: this.newDataType || '' },
          },
        });
      } else {
        this.args.onSave({
          predicate: this.newPredicate,
          object: { termType: 'NamedNode', value: this.newObjectValue },
        });
      }
    }
  };
  get valueTypeDirty() {
    return this.valueType !== this.args.property?.object.termType;
  }
  get dataTypeDirty() {
    const givenObject = this.args.property?.object;
    if (givenObject && givenObject.termType === 'Literal') {
      return (
        this.newDataType && this.newDataType !== givenObject.datatype.value
      );
    }
    return false;
  }
  get languageDirty() {
    const givenObject = this.args.property?.object;
    if (givenObject && givenObject.termType === 'Literal') {
      return this.newLanguage && this.newLanguage !== givenObject.language;
    }
    return false;
  }

  get canSave() {
    return (
      this.newPredicate &&
      this.newObjectValue &&
      (this.newPredicate !== this.args.property?.predicate ||
        this.newObjectValue !== this.args.property?.object.value ||
        this.dataTypeDirty ||
        this.languageDirty)
    );
  }
  @action
  selectValueType(newValue: 'Literal' | 'NamedNode') {
    this.valueType = newValue;
  }
  @action
  updateDataType(newValue: string) {
    if (!newValue.length) {
      this.newDataType = undefined;
    } else {
      this.newDataType = newValue;
    }
  }
  @action
  updateLanguage(newValue: string) {
    if (!newValue.length) {
      this.newLanguage = undefined;
    } else {
      this.newLanguage = newValue;
    }
  }
}
