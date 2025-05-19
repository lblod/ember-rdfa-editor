import type SayController from '#root/core/say-controller.ts';
import {
  type OutgoingTriple,
  type SayTermType,
} from '#root/core/rdfa-processor.ts';
import type { PNode } from '#root/prosemirror-aliases.ts';

export type StringDisplay = string;
export type StrongDisplay = { strong: string };
export type PillDisplay = { pill: string };
export type HiddenDisplay = { hidden: true };
export type DisplayElement =
  | StringDisplay
  | StrongDisplay
  | PillDisplay
  | HiddenDisplay;
export type DisplayMeta = { title?: string };
export type DisplayConfig =
  | { meta: DisplayMeta; elements: DisplayElement[] }
  | DisplayElement[];

interface GeneratorContext {
  controller: SayController;
}
export type DisplayGenerator<T> = (
  value: T,
  context: GeneratorContext,
) => DisplayConfig | Promise<DisplayConfig>;

export type RdfaVisualizerConfig = {
  debounceTime?: number;
  /**
   * Keep the visualiser displayed while refreshing to keep any expanded sections expanded.
   * WARNING: This will cause lag on typing in larger documents, so should be used with care.
   */
  keepOpen?: boolean;
  displayConfig: {
    predicate?: DisplayGenerator<OutgoingTriple>;
    ResourceNode?: DisplayGenerator<PNode>;
  } & Partial<
    Omit<Record<SayTermType, DisplayGenerator<OutgoingTriple>>, 'ResourceNode'>
  >;
};
