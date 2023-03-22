export type ResizeFunction = (
  element: HTMLElement,
  width: number,
  height: number
) => void;

export const updateSize: ResizeFunction = (element, width, height) => {
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
};

export const updateWidth: ResizeFunction = (element, width) => {
  element.style.width = `${width}px`;
};

export const updateHeight: ResizeFunction = (element, _width, height) => {
  element.style.height = `${height}px`;
};
