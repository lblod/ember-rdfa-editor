// The types of the ember-intl `t` helper, at least in v5.7.2 seem to expect 0 arguments instead of
// requiring 1 string. These types are taken from the latest ember-intl.
declare module 'ember-intl/helpers/t' {
  import Helper from '@ember/component/helper';

  interface TSignature {
    Args: {
      Named?: Options & { allowEmpty?: boolean };
      Positional: [Value] | [Value, Options];
    };
    Return: string;
  }

  export default class THelper extends Helper<TSignature> {}
}
