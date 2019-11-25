import Controller from '@ember/controller';

export default Controller.extend({
  isEditable: true,
  value: ``,
  actions: {
    debug(info) {
      this.set('debug', info);
    },
    rdfaEditorInit(rawEditor) {
      this.set('rawEditor', rawEditor);
    }
  }
});
