export function unwrapElement(element: Element): void {
  element.outerHTML = element.innerHTML;
}
