import type {
  IncomingTriple,
  OutgoingTriple,
} from '#root/core/rdfa-processor.ts';

export interface StatusMessage {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type PropertyOrBacklink = OutgoingTriple | IncomingTriple;
type CreationStatus = {
  mode: 'creation';
  subject?: string;
};
type UpdateStatus = {
  mode: 'update';
  propertyOrBacklink: PropertyOrBacklink;
};

export type Status = CreationStatus | UpdateStatus;
