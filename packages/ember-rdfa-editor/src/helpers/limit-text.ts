import { helper } from '@ember/component/helper';

export function limitText([string]: string[]) {
  if (string && string.length > 140) {
    return string.slice(0, 140) + '...';
  } else {
    return string;
  }
}
export default helper(limitText);
