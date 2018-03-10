import { helper } from '@ember/component/helper';

export function isUri(params) {
  const uri = params[0];
  return uri.includes('://') ||
    uri.startsWith('#') ||
    uri.startsWith('/') ||
    uri.startsWith('./') ||
    uri.startsWith('../');
}

export default helper(isUri);
