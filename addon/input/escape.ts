export default function handleEscape() {
  return function () {
    const activeElement = document.activeElement;
    if (activeElement) {
      (activeElement as HTMLElement).blur();
    }
  };
}
