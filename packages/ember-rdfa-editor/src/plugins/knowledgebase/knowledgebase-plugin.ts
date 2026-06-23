import { KnowledgeBase, newestKb } from '#root/core/rdfa/knowledge-base.ts';
import { ProsePlugin } from '#root/prosemirror-aliases.ts';
import { EditorState, PluginKey } from 'prosemirror-state';
export const knownledgeBaseKey = new PluginKey<KnowledgeBasePluginState>(
  'knowledgebase',
);
interface KnowledgeBasePluginArgs {
  pathFromRoot: Node[];
  baseIRI: string;
  rootNode: Node;
}
interface KnowledgeBasePluginState {
  knowledgeBase: KnowledgeBase;
}
export function knowledgeBasePlugin({
  pathFromRoot,
  baseIRI,
  rootNode,
}: KnowledgeBasePluginArgs): ProsePlugin<KnowledgeBasePluginState> {
  const initialKb = KnowledgeBase.fromHtmlNode(rootNode, pathFromRoot, baseIRI);
  return new ProsePlugin<KnowledgeBasePluginState>({
    key: knownledgeBaseKey,
    state: {
      init(config) {
        if (config.schema) {
          const cachedKb = config.schema.cached['knowledgeBase'] as
            | KnowledgeBase
            | undefined;

          if (cachedKb) {
            const newest = newestKb(cachedKb, initialKb);
            config.schema.cached['knowledgeBase'] = newest;
            return { knowledgeBase: newest };
          }
        }
        return { knowledgeBase: initialKb };
      },
      apply(_tr, value, _oldState, newState) {
        let knowledgeBase = value.knowledgeBase;
        const fromSchemaCache = newState.schema.cached['knowledgeBase'] as
          | KnowledgeBase
          | undefined;

        if (fromSchemaCache) {
          const newest = newestKb(fromSchemaCache, knowledgeBase);
          newState.schema.cached['knowledgeBase'] = newest;
          knowledgeBase = newest;
        }

        return {
          knowledgeBase,
        };
      },
    },
  });
}
export function getKb(state: EditorState) {
  return knownledgeBaseKey.getState(state);
}
