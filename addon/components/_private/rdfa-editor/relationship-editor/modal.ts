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
  @tracked errorMessage = '';

  get isAddExisting() {
    return this.args.addRelationshipType === 'existing';
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
    if (this.canSave) {
      this.args.onSave(this.newPredicate, this.objectRdfaId);
    }
  };

  get canSave() {
    if (!this.newPredicate) return false;
    switch (this.args.addRelationshipType) {
      case 'existing':
        return !!this.objectRdfaId;
      case 'resource':
      case 'content':
        return true;
      case 'unspecified':
      default:
        return false;
    }
  }
}
