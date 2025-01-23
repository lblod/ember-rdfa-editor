function isOrderedListSymbol(symbol: string): boolean {
  return /[0-9a-np-z]\S/g.test(symbol.toLowerCase());
}

function getListTypeNode(element: Element): Node | null {
  return (
    element.querySelector('[style="mso-list:Ignore"]') ||
    element.querySelector('span[lang]')
  );
}

export function isOrderedList(element: Element): boolean {
  const listTypeNode = getListTypeNode(element);

  if (!listTypeNode) {
    return false;
  }

  return isOrderedListSymbol(listTypeNode.textContent || '');
}
