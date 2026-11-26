export function assertFormDataValueIsString(
  value: FormDataEntryValue,
): asserts value is string {
  if (typeof value === 'string') {
    return;
  }
  throw new Error('Form value expected to be a string, but was a file');
}
export function getFormValue(
  formData?: FormData | null,
  key?: string,
): string | null {
  if (!formData || !key) {
    return null;
  }
  const value = formData.get(key);
  if (!value) {
    return null;
  }
  assertFormDataValueIsString(value);
  return value;
}
export function hasFormValue(
  formData?: FormData | null,
  key?: string,
): boolean {
  const value = getFormValue(formData, key);
  if (!value) {
    return false;
  }
  return value.length > 0;
}
