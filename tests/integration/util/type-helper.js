import { triggerKeyEvent } from '@ember/test-helpers';
export default async function type(container, string) {
  const stringArray = string.split('');
  for (let i = 0; i < stringArray.length; i++) {
    const key = stringArray[i];
    let keyCode = specialCharacters[key]
      ? specialCharacters[key]
      : string.charCodeAt(i) - 32;
    await triggerKeyEvent(container, 'keydown', keyCode);
  }
}

const specialCharacters = {
  '#': '#',
  ' ': 32,
};
