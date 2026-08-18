import { on } from '@ember/modifier';
import Component from '@glimmer/component';

type IsoDate = string;

type Signature = {
  Args: {
    id?: string;
    value?: IsoDate | Date;
    min?: IsoDate | Date;
    max?: IsoDate | Date;
    disabled?: boolean;
    required?: boolean;
    onChange?: (isoDate: IsoDate | null, date: Date | null) => void;
  };
};

function toDateInputValue(date: IsoDate | Date | undefined) {
  if (!date) return null;
  if (typeof date === 'string') return date; 
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDate(string: string) {
  return new Date(string + 'T00:00:00');
}

export default class extends Component<Signature> {
  onChange = (event: Event) => {
    const dateString = (event.target as HTMLInputElement).value;
    this.args.onChange?.(dateString, toDate(dateString));
  };

  <template>
    <input
      type="date"
      id={{@id}}
      max={{toDateInputValue @max}}
      min={{toDateInputValue @min}}
      value={{toDateInputValue @value}}
      required={{@required}}
      {{on "change" this.onChange}}
      class="au-c-input"
      ...attributes
    />
  </template>
}
