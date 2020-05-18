import Route from '@ember/routing/route';
import sampleData from '../config/sample-data';

export default Route.extend({
  model() {
    return sampleData;
  }
});
