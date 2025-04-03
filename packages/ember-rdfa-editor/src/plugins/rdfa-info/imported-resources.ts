import {
  type TransactionMonad,
  type TransactionMonadResult,
} from '#root/utils/transaction-utils.ts';
import { IMPORTED_RESOURCES_ATTR } from '../imported-resources/index.ts';

export function addImportedResource({
  resource,
}: {
  resource: string;
}): TransactionMonad<boolean> {
  return function (state): TransactionMonadResult<boolean> {
    const tr = state.tr;

    let result = false;
    const imported = state.doc.attrs[IMPORTED_RESOURCES_ATTR] as string[];
    if (!imported.includes(resource)) {
      tr.setDocAttribute(IMPORTED_RESOURCES_ATTR, [...imported, resource]);
      result = true;
    }

    return {
      initialState: state,
      transaction: tr,
      result,
    };
  };
}
