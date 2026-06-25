// Part of variable-plugin
import { v4 as uuid } from 'uuid';

export function generateVariableUri() {
  return `http://data.lblod.info/variable/${uuid()}`;
}

export function generateVariableInstanceUri({
  templateMode = false,
}: {
  templateMode?: boolean;
} = {}) {
  if (templateMode) {
    return `http://data.lblod.info/variable-instances/--ref-uuid4-${uuid()}`;
  } else {
    return `http://data.lblod.info/variable-instances/${uuid()}`;
  }
}
