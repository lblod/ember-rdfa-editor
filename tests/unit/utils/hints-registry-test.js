import hintsRegistry from 'dummy/utils/hints-registry';
import { module, test } from 'qunit';

module('Unit | Utility | hints registry', {unit: true});

test('add text, returns correct hrId', function(assert) {
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');

  assert.equal(5, hrId.startIdx);
  assert.equal(7, hrId.endIdx);
  assert.equal(3, hrId.delta);

});

test('remove text, returns correct hrId', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.removeText(3,7);

  assert.equal(3, hrId.startIdx);
  assert.equal(7, hrId.endIdx);
  assert.equal(-5, hrId.delta);

});

test('adding a hint, updates the registry', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [1,2], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);

  assert.equal(1, registry.registry.length);

});

test('inserting text starting on index 1 and with hint located on [1,2], shifts the location of the hint to the right as a block', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [1,2], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.insertText(1, 'bar');
  let updatedHint = registry.registry[0];

  assert.equal(4, updatedHint.location[0]);
  assert.equal(5, updatedHint.location[1]);

});

test('removing text on [3,4] and with hint located on [5,6], shifts the location of the hint to the left as a block', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [5,6], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.removeText(3, 4);
  let updatedHint = registry.registry[0];

  assert.equal(3, updatedHint.location[0]);
  assert.equal(4, updatedHint.location[1]);

});

test('inserting text on 2 and with hint located on [1,2], expands the block of the hint', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [1,2], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.insertText(2, 'bar');
  let updatedHint = registry.registry[0];

  assert.equal(1, updatedHint.location[0]);
  assert.equal(5, updatedHint.location[1]);

});

test('removing text on [1,1] and with hint located on [1,2], shrinks the block of the hint', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [1,2], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.removeText(1, 1);
  let updatedHint = registry.registry[0];

  assert.equal(1, updatedHint.location[0]);
  assert.equal(1, updatedHint.location[1]);

});

test('removing text on [1,2] and with hint located on [1,2], removes the hint', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [1,2], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.removeText(1, 2);

  assert.equal(0, registry.registry.length);

});

test('removing text after hint, leaves location of hint unaffected', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [1,2], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.removeText(3, 4);
  let updatedHint = registry.registry[0];

  assert.equal(1, updatedHint.location[0]);
  assert.equal(2, updatedHint.location[1]);

});

test('getting hint at location, where location of hints has changed in the mean but hints still exist, returns correct hint with updated location', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [5,6], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.removeText(3, 4);

  hint = registry.getHintsAtLocation([5,6], hrId)[0];

  assert.equal(3, hint.location[0]);
  assert.equal(4, hint.location[1]);
  
});

test('getting hint a location, for unexisting plugin, returns empty hints', function(assert){
  let registry = hintsRegistry.create();
  let hrId = registry.insertText(5, 'foo');
  let hint = {location: [5,6], info: {}, card: 'dummy'};
  registry.addHints(hrId, 'dummy', [hint]);
  registry.insertText(3, 4);

  let hints = registry.getHintsAtLocation([5,6], hrId, 'unexisting-plugin');
  assert.equal(0, hints.length);

});
