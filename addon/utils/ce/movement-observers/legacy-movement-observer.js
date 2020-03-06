export default class LegacyMovementObserver {
  constructor({notify}) {
    this.notify = notify;
  }

  handleMovement(document, oldSelection, newSelection) {
    const region = [newSelection.startNode.position, newSelection.endNode.position];
    this.notify(region);
  }
}
