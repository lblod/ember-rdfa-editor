import sampleData from '../config/sample-data';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  model() {
    return sampleData;
  }
}
