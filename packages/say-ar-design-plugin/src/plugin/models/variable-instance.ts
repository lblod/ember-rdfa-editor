import type Variable from '#root/plugin/models/variable.ts';

export default interface VariableInstance {
  id: string | null;
  uri: string;
  value?: string;
  valueLabel?: string;

  variable: Variable;
}
