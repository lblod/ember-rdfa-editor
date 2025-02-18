/* eslint-disable */
//@ts-nocheck

import { equiv } from 'qunit';

export function deepArrayContains(
  array: unknown[],
  element: unknown,
  message?: string,
) {
  const result = array.some((val) => equiv(val, element));
  this.pushResult({
    result,
    actual: array,
    expected: element,
    message,
  });
}
