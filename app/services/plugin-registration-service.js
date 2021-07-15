import {getOwner} from "@ember/application";
import Service from "@ember/service";
import editorProfiles from '../config/active-plugins';

export default class PluginRegistrationService extends Service {
  editor = null

  registerServicesInProfile(profile, editor) {
    const plugins = editorProfiles[profile];
    if (!plugins) {
      throw new Error(`Profile ${profile} not found`);
    }

    for (const plugin of plugins) {
      this.registerService(plugin, editor);
    }
  }

  registerService(name, editor) {
    const service = getOwner(this).lookup(`service:${name}`);
    service.register(editor);
  }
}
