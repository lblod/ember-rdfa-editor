import { type AsyncHasMany } from '@warp-drive/legacy/model';
import type MeasureDesign from './measure-design.ts';

export default interface ArDesign {
  id: string | null;
  uri: string;
  name: string;
  date: Date;

  measureDesigns: AsyncHasMany<MeasureDesign> | Promise<MeasureDesign[]>;
}
