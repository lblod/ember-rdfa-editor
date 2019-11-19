import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('ce', function(){
    this.route('lists');
    this.route('editor', function(){
      this.route('update-before-after');
    });
  });
  this.route('rdfa', function(){});
});
