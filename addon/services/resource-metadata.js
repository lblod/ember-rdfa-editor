import Service from '@ember/service';

/**
* Service in charge of querying the label and comment correspondent to an uri from the backend
*
* @module rdfa-editor
* @class ResourceMetadataService
* @extends Service
*/
export default class ResourceMetadataService extends Service {
  async fetch(uri) {
    const response = await fetch('/resource-labels/getInfo', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({term: uri})
    });
    const json = await response.json();
    return json;
  }
}
