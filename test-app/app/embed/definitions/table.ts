import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import type { PluginInitializer } from '../embedded-plugin.ts';
import { mergeConfigs } from '../setup/defaults';

export type TableConfig = {
  tableGroup: string;
  cellContent: string;
  inlineBorderStyle: { width: string; style?: string; color: string };
  rowBackground?: { even?: string; odd?: string };
};

const defaultTableConfig: TableConfig = {
  tableGroup: 'block',
  cellContent: 'block+',
  inlineBorderStyle: { width: '0.5px', color: '#CCD1D9' },
  rowBackground: undefined,
};
export const tableSetup = (({ options }) => {
  const config = mergeConfigs(defaultTableConfig, options?.table);
  const nodes = {
    ...tableNodes(config),
  };
  const prosePlugins = [...tablePlugins, tableKeymap];
  return {
    name: 'table',
    config,
    nodes,
    prosePlugins,
  };
}) satisfies PluginInitializer;
