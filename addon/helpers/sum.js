import { helper } from '@ember/component/helper';

export function sum(params) {
  return params.reduce((a, b) => {
    if(!b) return a;
    return a + b;
  });
}

export default helper(sum);