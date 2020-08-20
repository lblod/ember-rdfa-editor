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
    const termEncoded = encodeURIComponent(uri);
    const response = await fetch(`/resource-labels/info?term=${termEncoded}`, {
      method: 'GET',
    });
    const json = await response.json();
    return {
      label: json.attributes ? json.attributes.label : '',
      comment: json.attributes ? json.attributes.comment : '',
    };
  }
}
