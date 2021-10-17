import Application from '@ember/application';
import TypingPlugin from "typing-plugin/typing-plugin";
import TextStylesPlugin from "text-styles-plugin/text-styles-plugin";
import ContentControlPlugin from "content-control-plugin/content-control-plugin";
import DeletionPlugin from "deletion-plugin/deletion-plugin";
import HistoryPlugin from "history-plugin/history-plugin";
import ListsPlugin from "lists-plugin/lists-plugin";
import SearchingPlugin from "searching-plugin/searching-plugin";
import TablesPlugin from "tables-plugin/tables-plugin";
import TriplestorePlugin from "triplestore-plugin/triplestore-plugin";
import RdfaContextPlugin from "rdfa-context-plugin/rdfa-context-plugin";

export function initialize(application: Application): void {
  application.register("plugin:content-control", ContentControlPlugin, {singleton: false});
  application.register("plugin:deletion", DeletionPlugin, {singleton: false});
  application.register("plugin:history", HistoryPlugin, {singleton: false});
  application.register("plugin:lists", ListsPlugin, {singleton: false});
  application.register("plugin:searching", SearchingPlugin, {singleton: false});
  application.register("plugin:tables", TablesPlugin, {singleton: false});
  application.register("plugin:text-styles", TextStylesPlugin, {singleton: false});
  application.register("plugin:typing", TypingPlugin, {singleton: false});
  application.register("plugin:triplestore", TriplestorePlugin, {singleton: false});
  application.register("plugin:rdfa-context", RdfaContextPlugin, {singleton: false});
}

export default {
  initialize
};
