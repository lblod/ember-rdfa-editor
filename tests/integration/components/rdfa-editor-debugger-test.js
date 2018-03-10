import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('rdfa-editor-debugger', 'Integration | Component | rdfa editor debugger', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{rdfa-editor-debugger}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#rdfa-editor-debugger}}
      template block text
    {{/rdfa-editor-debugger}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
