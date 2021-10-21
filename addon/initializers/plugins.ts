import Application from '@ember/application';
import TypingPlugin from "typing-plugin/typing-plugin";
import TextStylesPlugin from "text-styles-plugin/text-styles-plugin";
import ContentControlPlugin from "content-control-plugin/content-control-plugin";
import DeletionPlugin from "deletion-plugin/deletion-plugin";
import HistoryPlugin from "history-plugin/history-plugin";
import ListsPlugin from "lists-plugin/lists-plugin";
import SearchingPlugin from "searching-plugin/searching-plugin";
import TablesPlugin from "tables-plugin/tables-plugin";
import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import NavigationPlugin from "navigation-plugin/navigation-plugin";
import ClipboardPlugin from "clipboard-plugin/clipboard-plugin";

function pluginFactory(plugin: new () => EditorPlugin): { create: (initializers: unknown) => EditorPlugin } {
  const pluginInstance = new plugin();
  return {
    create: (initializers => {
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    })
  };
}

export function initialize(application: Application): void {
  application.register("plugin:content-control", pluginFactory(ContentControlPlugin), {singleton: false});
  application.register("plugin:deletion", pluginFactory(DeletionPlugin), {singleton: false});
  application.register("plugin:history", pluginFactory(HistoryPlugin), {singleton: false});
  application.register("plugin:lists", pluginFactory(ListsPlugin), {singleton: false});
  application.register("plugin:searching", pluginFactory(SearchingPlugin), {singleton: false});
  application.register("plugin:tables", pluginFactory(TablesPlugin), {singleton: false});
  application.register("plugin:text-styles", pluginFactory(TextStylesPlugin), {singleton: false});
  application.register("plugin:typing", pluginFactory(TypingPlugin), {singleton: false});
  application.register("plugin:navigation", pluginFactory(NavigationPlugin), {singleton: false});
  application.register("plugin:clipboard", pluginFactory(ClipboardPlugin), {singleton: false});
}

export default {
  initialize
};
