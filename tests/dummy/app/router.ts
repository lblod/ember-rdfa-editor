import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}
Router.map(function () {
  this.route('plugins');
  this.route('vendors');
  this.route('backspace');
  this.route('editable-block');
});
