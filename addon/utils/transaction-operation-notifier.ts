import Transaction, { TransactionListener } from '../core/transaction';
import Operation from '../model/operations/operation';

export default class TransactionOperationNotifier {
  listeners: TransactionListener[] = [];

  notify(transaction: Transaction, operation: Operation) {
    for (const listener of this.listeners) {
      listener(transaction, operation);
    }
  }

  addListener(listener: TransactionListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: TransactionListener): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners = this.listeners.splice(index, 1);
    }
  }
}
