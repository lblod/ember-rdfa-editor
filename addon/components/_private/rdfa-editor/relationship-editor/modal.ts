import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaRelationshipEditor from './index';

const typeChoices = ['existing', 'content', 'resource'] as const;
export type AddRelationshipType = 'unspecified' | (typeof typeChoices)[number];

type Args = {
  addRelationshipType?: AddRelationshipType;
  setAddType: (type: null | AddRelationshipType) => void;
  onSave: RdfaRelationshipEditor['saveNewRelationship'];
  rdfaIds: string[];
};

export default class RelationshipEditorModal extends Component<Args> {
  types = typeChoices;
  @tracked newPredicate = '';
  @tracked objectRdfaId = '';
  @tracked resourceUriBase = '';
  @tracked errorMessage = '';

  get isAddExisting() {
    return this.args.addRelationshipType === 'existing';
  }
  get isAddResource() {
    return this.args.addRelationshipType === 'resource';
  }

  get rdfaIds() {
    return this.args.rdfaIds;
  }

  updatePredicate = (event: InputEvent) => {
    this.newPredicate = (event.target as HTMLInputElement).value;
  };
  updateObject = (rdfaId: string) => {
    this.objectRdfaId = rdfaId;
  };
  updateUriBase = (event: InputEvent) => {
    this.resourceUriBase = (event.target as HTMLInputElement).value;
  };

  setAddType = (event: InputEvent) => {
    this.args.setAddType(
      (event.target as HTMLInputElement).value as AddRelationshipType,
    );
  };

  cancel = () => {
    this.args.setAddType(null);
  };

  save = (event: Event) => {
    event.preventDefault();
    if (
      this.canSave &&
      this.args.addRelationshipType &&
      this.args.addRelationshipType !== 'unspecified'
    ) {
      if (this.args.addRelationshipType === 'existing') {
        this.args.onSave({
          type: this.args.addRelationshipType,
          predicate: this.newPredicate,
          rdfaid: this.objectRdfaId,
        });
      } else {
        this.args.onSave({
          type: this.args.addRelationshipType,
          predicate: this.newPredicate,
          uriBase: this.resourceUriBase,
        });
      }
    }
  };

  get canSave() {
    if (!this.newPredicate) return false;
    switch (this.args.addRelationshipType) {
      case 'existing':
        return !!this.objectRdfaId;
      case 'resource':
        return !!this.resourceUriBase;
      case 'content':
        return true;
      case 'unspecified':
      default:
        return false;
    }
  }
}
