export default interface Variable {
  id: string | null;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'codelist'
    | 'location';

  label: string;
  uri: string;
  source: string;
  codelist?: string;
}
