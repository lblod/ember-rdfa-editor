import Service from '@ember/service';
import {A} from '@ember/array';
import {get} from '@ember/object';
import {runInDebug} from '@ember/debug';
import RSVP from 'rsvp';
import editorProfiles from '../config/editor-profiles';
import {next} from '@ember/runloop';
import PluginEditorApi from '@lblod/ember-rdfa-editor/utils/plugin-editor-api';
import PluginHintsRegistryApi from '@lblod/ember-rdfa-editor/utils/plugin-hints-registry-api';
import {getOwner} from '@ember/application';

// debug helper
function debug(message) {
  runInDebug( () => console.debug(message)); // eslint-disable-line no-console
}

/**
 * RDFa Editor system dispatcher that dispatches editor events to the configured plugins
 *
 * @module editor-core
 * @class RdfaEditorDispatcher
 * @extends Service
 */
export default class RdfaEditorDispatcher extends Service {
  constructor(){
    super(...arguments);
    let profileArrays = [];
    for( var key in editorProfiles ) {
      profileArrays = [...profileArrays, ...editorProfiles[key]];
    }
    const owner = getOwner(this);
    const serviceNames = new Set(profileArrays);
    this.pluginServices = [];
    for (const name of serviceNames) {
      const service = owner.lookup(`service:${name}`);
      if (service) {
        this.pluginServices.push(service);
      }
      else {
        console.warn('could not find plugin ' + name); // eslint-disable-line no-console
      }
    }
  }

  initializeServices(editor) {
    for (const pluginService of this.pluginServices) {
      if (typeof (pluginService.get("initialize")) === "function") {
        pluginService.initialize(editor);
      }
    }
  }

  /**
  * Dispatch an event to all plugins of a given profile
  *
  * @method dispatch
  *
  * @param {string} profile Editor profile
  * @param {Object} hintsRegistryIndex Unique identifier of the event in the hints registry
  * @param {Array} rdfaBlocks RDFa blocks of the text snippets the event applies on
  * @param {Object} hintsRegistry Registry of hints in the editor
  * @param {Object} editor The RDFa editor instance
  * @param {Array} Optional argument to contain extra info.
  *
  * @return {Promise} A promise that resolves when the event has been dispatched to the plugins
  *
  */
  dispatch(profile, hintsRegistryIndex, rdfaBlocks, hintsRegistry, editor, extraInfo = []){
    const self = this;
    return new RSVP.Promise((resolve) => {
      const plugins = editorProfiles[profile];
      if( plugins ){
        for (let plugin of plugins) {
          const pluginService = getOwner(self).lookup(`service:${plugin}`);
          const pluginApiversion = pluginService.editorApi ? pluginService.editorApi : "genesis";
          switch (pluginApiversion) {
          case "0.1":
            debug(`EXPERIMENTAL: Plugin ${plugin} is using an experimental editor api version (${pluginApiversion}).`);
            this.dispatchV1(plugin, pluginService, hintsRegistryIndex, rdfaBlocks, hintsRegistry, editor, extraInfo);
            break;
          default:
            this.dispatchGenesis(plugin, pluginService, hintsRegistryIndex, rdfaBlocks, hintsRegistry, editor, extraInfo);
            break;
          }
        }
      }
      else {
        debug(`Editor plugin profile "${profile}" was not found`, { id: "disptacher_no_profile" });
      }
      resolve();
    });
  }

  dispatchToExecute(plugin, pluginService, args) {
    if (typeof(get(pluginService, 'execute.perform')) == 'function') { // ember-concurrency task
      next(() => { pluginService.get('execute').perform(...args); });
    }
    else if (typeof(get(pluginService, 'execute')) == 'function') {
      pluginService.execute(...args);
    } else {
      debug(`Plugin ${plugin} doesn't provide 'execute' as function nor ember-concurrency task`);
    }
  }

  dispatchGenesis(plugin, pluginService, hintsRegistryIndex, rdfaBlocks, hintsRegistry, editor, extraInfo) {
    this.dispatchToExecute(plugin, pluginService, [hintsRegistryIndex, rdfaBlocks, hintsRegistry, editor, extraInfo]);
  }

  dispatchV1(plugin, pluginService, hintsRegistryIndex, rdfaBlocks, hintsRegistry, editor, extraInfo) {
    const pluginEditorApi = new PluginEditorApi(editor, hintsRegistry, hintsRegistryIndex);
    const hintsRegistryApi = new PluginHintsRegistryApi(hintsRegistry, hintsRegistryIndex);
    this.dispatchToExecute(plugin, pluginService, [rdfaBlocks, hintsRegistryApi, pluginEditorApi, extraInfo]);
  }

  async requestHints(profile, context, editor) {
    const plugins = editorProfiles[profile];
    const hints = A();
    if (plugins) {
      for (let plugin of plugins) {
        let pluginService = getOwner(this).lookup(`service:${plugin}`);
        if (pluginService.suggestHints) {
          let receivedHints=await pluginService.suggestHints(context, editor);
          hints.pushObjects(receivedHints);
        }
      }
    }
    return hints;
  }
}
