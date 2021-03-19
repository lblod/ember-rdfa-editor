import { modifier } from 'ember-modifier';

export default modifier(function onClickInside(element, [callback]) {
  function handleClick(event) {
    if (element.contains(event.target)) {
      callback();
    }
  }

  document.addEventListener("click", handleClick);

  return () => {
    document.removeEventListener("click", handleClick);
  };
});
