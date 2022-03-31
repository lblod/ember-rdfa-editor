import Datastore from '@lblod/ember-rdfa-editor/model/util/datastore/datastore';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import EventBus, {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/model/mark';
import { TextMatch } from '@lblod/ember-rdfa-editor/utils/match-text';

export type LiveMarkSpec =
  | string
  | {
      name: string;
      attributesBuilder?: (textMatch: TextMatch) => AttributeSpec;
    };

export interface LiveMarkSetArgs {
  datastoreQuery: (datastore: Datastore) => TextMatch[];
  liveMarkSpecs: LiveMarkSpec[];
}

export interface TextMatchDiff {
  matchesToRemove: Set<TextMatch>;
  matchesToAdd: Set<TextMatch>;
}

export default class LiveMarkSet {
  private _controller: Controller;
  private _datastoreQuery: (datastore: Datastore) => TextMatch[];
  private _privateBus: EventBus;
  private _liveMarkSpecs: LiveMarkSpec[];
  private _activeMatches: Map<string, TextMatch>;

  constructor(
    controller: Controller,
    { datastoreQuery, liveMarkSpecs }: LiveMarkSetArgs
  ) {
    this._controller = controller;
    this._datastoreQuery = datastoreQuery;
    this._privateBus = new EventBus();
    this._controller.onEvent('contentChanged', this.update);
    this._liveMarkSpecs = liveMarkSpecs;
    this._activeMatches = new Map<string, TextMatch>();
  }

  get controller(): Controller {
    return this._controller;
  }

  get datastoreQuery(): (datastore: Datastore) => TextMatch[] {
    return this._datastoreQuery;
  }

  get liveMarkSpecs(): LiveMarkSpec[] {
    return this._liveMarkSpecs;
  }

  private update = () => {
    const { matchesToAdd, matchesToRemove } = this.calculateRanges();
    const mutator = this.controller.getMutator();
    const marksRegistry = this.controller.marksRegistry;

    console.log('TOADD', matchesToAdd);
    console.log('TOREMOVE', matchesToRemove);
    for (const match of matchesToRemove) {
      for (const liveSpec of this.liveMarkSpecs) {
        let markSpec;
        if (typeof liveSpec === 'string') {
          markSpec = marksRegistry.lookupMark(liveSpec);
        } else {
          markSpec = marksRegistry.lookupMark(liveSpec.name);
        }
        if (markSpec) {
          // TODO this is a hack to workaround the current awkwardness of removing marks
          // needs a rethink
          mutator.removeMark(match.range, markSpec, {
            setBy: this.controller.name,
          });
        } else {
          throw new ModelError(`Unrecognized mark: ${liveSpec.toString()}`);
        }
      }
      this._activeMatches.delete(match.range.toString());
    }
    for (const match of matchesToAdd) {
      for (const liveSpec of this.liveMarkSpecs) {
        let attributes: AttributeSpec = { setBy: this.controller.name };
        let markSpec;
        if (typeof liveSpec === 'string') {
          markSpec = marksRegistry.lookupMark(liveSpec);
        } else {
          markSpec = marksRegistry.lookupMark(liveSpec.name);
          if (liveSpec.attributesBuilder) {
            attributes = liveSpec.attributesBuilder(match);
          }
        }
        if (markSpec) {
          mutator.addMark(match.range, markSpec, attributes);
        } else {
          throw new ModelError(`Unrecognized mark: ${liveSpec.toString()}`);
        }
      }
      this._activeMatches.set(match.range.toString(), match);
    }
    // this.controller.selection.selectRange(mutator.mapRange(currentRange));
    // this.controller.write();
  };

  calculateRanges(): TextMatchDiff {
    const newMatches = this.datastoreQuery(this.controller.datastore);

    return {
      matchesToAdd: new Set(newMatches),
      matchesToRemove: new Set(this._activeMatches.values()),
    };
  }

  onEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config: ListenerConfig = {}
  ): void {
    return this._privateBus.on(eventName, callback, config);
  }

  offEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this._privateBus.off(eventName, callback, config);
  }

  destroy() {
    this.controller.offEvent('contentChanged', this.update);
  }
}
