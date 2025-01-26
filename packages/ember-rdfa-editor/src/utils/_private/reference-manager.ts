export class ReferenceManager<C, R> {
  private readonly map: Map<string, R>;

  private readonly constr: (config: C) => R;

  private readonly hash: (config: C) => string;

  constructor(constr: (config: C) => R, hash: (config: C) => string) {
    this.map = new Map();
    this.hash = hash;
    this.constr = constr;
  }

  get(config: C): R {
    let result = this.map.get(this.hash(config));
    if (result) {
      return result;
    } else {
      result = this.constr(config);
      this.map.set(this.hash(config), result);
      return result;
    }
  }
}
