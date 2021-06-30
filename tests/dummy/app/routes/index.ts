import Route from '@ember/routing/route';
import IndexController from "dummy/controllers";
import {action} from '@ember/object';

export default class IndexRoute extends Route {
  controller!: IndexController;

  @action
  willTransition() {
    this.controller.saveEditorContentToLocalStorage();
    this.controller.teardown();
  }

  setupController(controller: IndexController) {
    controller.setup();
  }
}
