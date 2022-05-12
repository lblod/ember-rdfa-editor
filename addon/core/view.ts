export default interface DomView {

  domRoot: HTMLElement;

}

export function updateDomViewFromState(view: DomView, state: State): void {

}
export function createDomView(domRoot: HTMLElement): DomView {
  return {domRoot}

}
