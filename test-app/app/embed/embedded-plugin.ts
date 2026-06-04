/* eslint-disable @typescript-eslint/no-explicit-any */
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import type { SayNodeViewConstructor } from '@lblod/ember-rdfa-editor/utils/ember-node';
// import type { Kebab } from '../utils/type-utils.ts';
// import type {
//   SidebarConfig,
//   SidebarListItemWidgetName,
//   SidebarWidgetName,
//   ToolbarConfig,
//   ToolbarWidgetName,
// } from './widgets';
import type {
  EmbeddedPlugins,
  OtherOptions,
  PluginOptions,
  SidebarListItemWidgets,
  SidebarWidgets,
  ToolbarWidgets,
} from './plugin-registry';
import type IntlService from 'ember-intl/services/intl';
import type { MarkSpec, ProsePlugin } from '@lblod/ember-rdfa-editor';
// import type {
//   EditorSetup,
//   InitializedPluginName,
// } from './setup/setup-plugins.ts';
type Kebab = any;
type SidebarConfig = any;
type SidebarListItemWidgetName = any;
type SidebarWidgetName = any;
type ToolbarConfig = any;
type ToolbarWidgetName = any;
type EditorSetup = any;
type InitializedPluginName = any;

/**
 * Valid plugin names, as defined by the registry
 */
export type PluginName = Extract<keyof EmbeddedPlugins, string>;
export type ToolbarWidgetMap = { [K in ToolbarWidgetName]?: ToolbarWidgets[K] };

/**
 * Spec for a plugin as it is understood in embeddable, a collection of
 * schema and other config.
 *
 * While you can use this type directly, it is recommended to just write a
 * pluginInitializer and use {@link SpecOf} to give you the most accurate type
 */
export interface EmbeddedPluginSpec {
  name: PluginName;
  nodes?: Record<string, SayNodeSpec>;
  marks?: Record<string, MarkSpec>;
  nodeViews?: Record<
    string,
    (controller: SayController) => SayNodeViewConstructor
  >;
  prosePlugins?: ProsePlugin[];
  config?: unknown;
  toolbarWidgets?: ToolbarWidgetMap;
  sidebarWidgets?: {
    [K in
      | SidebarWidgetName
      | SidebarListItemWidgetName]?: K extends SidebarWidgetName
      ? SidebarWidgets[K]
      : K extends SidebarListItemWidgetName
        ? SidebarListItemWidgets[K]
        : never;
  };
  afterSetup?: (setup: EditorSetup) => EditorSetup;
}

export type PluginInitArgs = EditorOptions & {
  intl: IntlService;
};
/**
 * The heart of the plugin system. Takes the args supplied by the user
 * (with some extras) and returns a plugin spec
 */
export type PluginInitializer = (args: PluginInitArgs) => EmbeddedPluginSpec;

/**
 * Infer the plugin spec from the returntype of the initializer.
 * By inferring rather than explicitly typing,
 * we maintain the most narrow type definition possible,
 * giving us excellent type information without having to resort to crazy
 * generics or overly verbose manual types
 */
export type SpecOf<F extends PluginInitializer> = F extends (
  args: PluginInitArgs,
) => infer P
  ? P extends EmbeddedPluginSpec
    ? P
    : never
  : never;

export type PluginSpecs = {
  [K in keyof EmbeddedPlugins]?: SpecOf<EmbeddedPlugins[K]>;
};

/**
 * Kebab-cased plugin names
 * TODO: deprecate kebab-casing
 */
export type KebabPluginName = Kebab<PluginName>;
/**
 * Kebab-cased plugin options and extra options to allow for non-kebab-cased
 * options
 * TODO: deprecate kebab-casing
 */
export type UserPluginOptions = PluginOptions & OtherOptions;

/**
 * User-facing config for the internal say-editor
 */
export interface EditorOptions {
  /**
   * The plugins to initialize the editor with.
   */
  plugins?: readonly Kebab<InitializedPluginName>[];
  /**
   * The options to initialize the editor with.
   */
  options?: UserPluginOptions;
  toolbar?: ToolbarConfig;
  sidebar?: SidebarConfig;
}
