import Application from '@ember/application';
import TypingPlugin from "typing-plugin/typing-plugin";
import TextStylesPlugin from "text-styles-plugin/text-styles-plugin";

export function initialize(application: Application): void {
  // application.inject('route', 'foo', 'service:foo');
  application.register("plugin:typing", TypingPlugin, {singleton: false});
  application.register("plugin:text-styles", TextStylesPlugin, {singleton: false});
}

export default {
  initialize
};
