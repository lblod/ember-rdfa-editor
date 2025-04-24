import type SayController from "#root/core/say-controller.ts";
import { type OutgoingTriple, type SayTermType } from "#root/core/rdfa-processor.ts";
import type { PNode } from "#root/prosemirror-aliases.ts";

export type StringDisplay = string;
export type StrongDisplay = { strong: string };
export type PillDisplay = { pill: string };
export type DisplayElement = StringDisplay | StrongDisplay | PillDisplay;
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
  predicate?: DisplayGenerator<OutgoingTriple>;
  ResourceNode?: DisplayGenerator<PNode>;
} & Partial<Omit<Record<SayTermType, DisplayGenerator<OutgoingTriple>>, 'ResourceNode'>>;
