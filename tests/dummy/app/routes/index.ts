import Route from '@ember/routing/route';
import IndexController from 'dummy/controllers';

export default class IndexRoute extends Route {
  setupController(controller: IndexController) {
    controller.setup();
  }
}
