/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { PluginInitArgs } from '../embedded-plugin';
// import type { SidebarCollapsibleConfig, SidebarConfig } from '../widgets';
type PluginInitArgs = any;
type SidebarCollapsibleConfig = any;
type SidebarConfig  = any;

export function defaultSidebar({
  plugins = [],
  options,
}: PluginInitArgs): SidebarConfig {
  const sidebar: SidebarConfig = [];
  if (
    plugins.includes('besluit-topic') &&
    options?.besluitTopic?.widgetLocation === 'sidebar'
  ) {
    sidebar.push('besluit:topic');
  }
  const insertContainer: SidebarCollapsibleConfig = [];
  if (plugins.includes('besluit')) {
    insertContainer.push('besluit:article-insert');
  }
  if (plugins.includes('lpdc')) {
    insertContainer.push('lpdc:insert');
  }
  if (plugins.includes('article-structure')) {
    insertContainer.push('article-structure:insert');
  }
  if (plugins.includes('citation')) {
    insertContainer.push('citation:insert');
  }
  if (plugins.includes('roadsign-regulation')) {
    insertContainer.push('roadsign-regulation:insert');
  }
  if (plugins.includes('location')) {
    insertContainer.push('location:insert');
  }
  if (plugins.includes('template-comments')) {
    insertContainer.push('template-comments:insert');
  }
  if (insertContainer.length) {
    sidebar.push(insertContainer);
  }
  if (plugins.includes('article-structure') || plugins.includes('besluit')) {
    sidebar.push('structure:edit');
  }
  if (plugins.includes('variable')) {
    sidebar.push('variable:insert');
    sidebar.push('variable:edit');
  }
  if (plugins.includes('template-comments')) {
    sidebar.push('template-comments:edit');
  }
  if (plugins.includes('citation')) {
    sidebar.push('citation:edit');
  }
  if (plugins.includes('rdfa-editor')) {
    sidebar.push(
      'devtools:rdfa-editor',
      'devtools:attribute-editor',
      'devtools:debug-info',
    );
  }
  return sidebar;
}
