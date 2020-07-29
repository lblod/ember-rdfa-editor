import Service from '@ember/service';

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
