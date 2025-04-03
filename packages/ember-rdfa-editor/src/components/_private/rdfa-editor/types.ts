import type { OutgoingTriple } from '#root/core/rdfa-processor.ts';

export interface StatusMessage {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type CreationStatus = {
  mode: 'creation';
  subject?: string;
};
export type UpdateStatus = {
  mode: 'update';
  subject?: string;
  property: OutgoingTriple;
};
export type Status = CreationStatus | UpdateStatus;
