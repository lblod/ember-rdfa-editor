export default class WrappingAttribute {

  private wrappingTagName: keyof HTMLElementTagNameMap;
  private _enabled: boolean = false;

  constructor(wrappingTagName: keyof HTMLElementTagNameMap) {
    this.wrappingTagName = wrappingTagName;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }
  toggle() {
    this._enabled = !this._enabled;
  }

}
