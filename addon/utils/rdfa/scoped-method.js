import { computed } from '@ember/object';

/**
 * Binds a method of an Ember.Object so it can be deeply referenced in
 * other components.
 * 
 * When would you need this?  When passing functions through to other
 * components, you should wrap them in an action helper.  However,
 * when passing methods this way, their scope is being changed.  The
 * method will therefore run in a different scope.
 *
 * Example use:
 *
 *     Ember.Object.extend( {
 *       value: 100,
 *       increaseValue: scoped( function(amount) {
 *         this.set( 'value', amount + this.value );
 *         return this.value;
 *       })
 *     });
 *
 * In a component where this would have value:
 *
 *     {{something-embedded someReference.thatObject.increaseValue}}
 */

export default function scopedMethod(functor) {
  return computed( function() {
    return functor.bind(this);
  });
}
