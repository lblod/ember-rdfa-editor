import Transaction, {
  OperationCallback,
  TransactionListenerOptions,
} from '../core/transaction';
import Operation from '../model/operations/operation';

export default class TransactionOperationNotifier {
  listeners: {
    callback: OperationCallback;
    options?: TransactionListenerOptions;
  }[] = [];

  notify(transaction: Transaction, operation: Operation) {
    for (const listener of this.listeners) {
      if (listener.options) {
        if (typeof listener.options.filter === 'string') {
          if (!(listener.options.filter === operation.type)) {
            continue;
          }
        } else {
          if (!listener.options.filter.includes(operation.type)) {
            continue;
          }
        }
      }
      listener.callback(transaction, operation);
    }
  }

  addListener(
    callback: OperationCallback,
    options?: TransactionListenerOptions
  ) {
    this.listeners.push({ callback, options });
  }

  removeListener(callback: OperationCallback): void {
    const index = this.listeners.findIndex(
      (listener) => listener.callback === callback
    );

    if (index >= 0) {
      this.listeners = this.listeners.splice(index, 1);
    }
  }
}
