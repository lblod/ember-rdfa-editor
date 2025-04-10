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

export function removeImportedResource({
  resource,
}: {
  resource: string;
}): TransactionMonad<boolean> {
  return function (state): TransactionMonadResult<boolean> {
    // TODO this is only called if the imported resource has no properties, but we should probably
    // check that to avoid breaking things if there is a bug
    const tr = state.tr;

    let result = false;
    const imported = state.doc.attrs[IMPORTED_RESOURCES_ATTR] as string[];
    if (imported.includes(resource)) {
      tr.setDocAttribute(
        IMPORTED_RESOURCES_ATTR,
        imported.filter((imp) => imp !== resource),
      );
      result = true;
    }

    return {
      initialState: state,
      transaction: tr,
      result,
    };
  };
}
