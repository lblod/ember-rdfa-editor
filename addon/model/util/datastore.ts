import dataset, {FastDataset} from '@graphy/memory.dataset.fast';

export default interface Datastore {

}

export class EditorStore implements Datastore {
  private dataSet: FastDataset = dataset();

}

