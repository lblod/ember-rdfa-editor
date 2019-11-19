import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function rdfaHtml(params) {
  return htmlSafe(params[0]);
}

export default helper(rdfaHtml);
