import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { localCopy } from 'tracked-toolbox';
import Component from '@glimmer/component';
import type * as RDF from '@rdfjs/types';
import type {
  ContentTriple,
  PlainTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { isSome } from '@lblod/ember-rdfa-editor/utils/_private/option';

type Args = {
  property?: PlainTriple | ContentTriple;
  onCancel: () => void;
  onSave: (property: PlainTriple | ContentTriple) => void;
};

export default class PropertyEditorModal extends Component<Args> {
  @localCopy('args.property.predicate') newPredicate?: string;
  @localCopy('args.property.object.value') newObjectValue?: string;
  @localCopy('args.property.object.datatype.value') newDataType?: string;
  @localCopy('args.property.object.language') newLanguage?: string;

  typeOptions = ['Literal', 'NamedNode', 'ContentLiteral'];
  @localCopy('args.property.object.termType', 'Literal')
  // SAFETY: using the default option of the localCopy decorator
  valueType!: 'Literal' | 'NamedNode' | 'ContentLiteral';
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
  get showDataTypeAndLanguage() {
    return this.valueType === 'Literal' || this.valueType === 'ContentLiteral';
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
    if (this.newPredicate) {
      if (this.valueType === 'ContentLiteral') {
        this.args.onSave({
          predicate: this.newPredicate,
          object: {
            termType: 'ContentLiteral',
            language: this.newLanguage || '',
            datatype: {
              termType: 'NamedNode',
              value: this.newDataType || '',
            },
          },
        });
      } else if (this.newObjectValue) {
        if (this.valueType === 'Literal') {
          this.args.onSave({
            predicate: this.newPredicate,
            object: {
              termType: 'Literal',
              value: this.newObjectValue,
              language: this.newLanguage || '',
              datatype: {
                termType: 'NamedNode',
                value: this.newDataType || '',
              },
            },
          });
        } else {
          this.args.onSave({
            predicate: this.newPredicate,
            object: { termType: 'NamedNode', value: this.newObjectValue },
          });
        }
      }
    }
  };
  get valueTypeDirty() {
    return this.valueType !== this.args.property?.object.termType;
  }
  get dataTypeDirty() {
    const givenObject = this.args.property?.object;
    if (
      givenObject &&
      (givenObject.termType === 'Literal' ||
        givenObject.termType === 'ContentLiteral')
    ) {
      return (
        isSome(this.newDataType) &&
        this.newDataType !== givenObject.datatype.value
      );
    }
    return false;
  }
  get languageDirty() {
    const givenObject = this.args.property?.object;
    if (
      givenObject &&
      (givenObject.termType === 'Literal' ||
        givenObject.termType === 'ContentLiteral')
    ) {
      return (
        isSome(this.newLanguage) && this.newLanguage !== givenObject.language
      );
    }
    return false;
  }
  get objectValueDirty() {
    const givenObject = this.args.property?.object;
    if (givenObject && givenObject.termType === 'Literal') {
      return this.newObjectValue && this.newObjectValue !== givenObject.value;
    }
    return true;
  }

  get canSave() {
    if (this.valueType === 'ContentLiteral') {
      return (
        this.newPredicate &&
        (this.newPredicate !== this.args.property?.predicate ||
          this.dataTypeDirty ||
          this.languageDirty)
      );
    }
    return (
      this.newPredicate &&
      this.newObjectValue &&
      (this.newPredicate !== this.args.property?.predicate ||
        this.objectValueDirty ||
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
