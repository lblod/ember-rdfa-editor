import type Variable from './variable.ts';

export default interface VariableInstance {
  id: string | null;
  uri: string;
  value?: string;
  valueLabel?: string;

  variable: Variable;
}
