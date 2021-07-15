import {getOwner} from "@ember/application";
import Service from "@ember/service";
import activePlugins from "../config/active-plugins";

export default class PluginRegistrationService extends Service {
  editor = null

  init() {
    super.init();
  }

  registerServicesInProfile(profile, editor) {
    const plugins = activePlugins[profile];
    if (!plugins) {
      throw new Error(`Profile ${profile} not found`);
    }

    for (const plugin of plugins) {
      this.registerService(plugin, editor);
    }
  }

  registerService(name, editor) {
    const service = getOwner(this).lookup(`service:${name}`);
    if (!service) {
      throw new Error(`Plugin ${name} not found`);
    }

    service.register(editor);
  }
}
