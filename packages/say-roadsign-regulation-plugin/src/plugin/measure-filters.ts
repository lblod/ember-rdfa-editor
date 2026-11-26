import { tracked } from '@glimmer/tracking';
import { ZONALITY_OPTIONS } from '#root/plugin/constants.ts';
import {
  type Category,
  type Code,
  type Option,
  type TypeOption,
  type Zonality,
} from '#root/plugin/types.ts';

export default class MeasureFilters {
  @tracked pageNumber = 0;

  @tracked selectedZonality?: Zonality;
  @tracked selectedCode?: Code;
  @tracked selectedType?: TypeOption;
  @tracked selectedCategory?: Category;

  readonly zonalityOptions: Zonality[] = [
    {
      uri: ZONALITY_OPTIONS.ZONAL,
      label: 'Zonaal',
    },
    {
      uri: ZONALITY_OPTIONS.NON_ZONAL,
      label: 'Niet zonaal',
    },
  ];

  changeType = (option: Option) => {
    if (!option) {
      this.selectedType = undefined;
    } else {
      this.selectedType = option;
      this.selectedCategory = undefined;
      this.selectedCode = undefined;
      this.resetPagination();
    }
  };

  changeCategory = (option: Option) => {
    if (!option) {
      this.selectedCategory = undefined;
    } else {
      this.selectedCategory = option;
      this.selectedCode = undefined;
      this.resetPagination();
    }
  };

  changeCode = (value: Code) => {
    this.selectedCode = value;
    this.resetPagination();
  };

  changeSelectedZonality = (value: string | undefined) => {
    const zonality = this.zonalityOptions.find(
      (option) => option.uri === value,
    );
    this.selectedZonality = zonality;
    this.resetPagination();
  };

  resetPagination = () => {
    this.pageNumber = 0;
  };

  goToPreviousPage = () => {
    this.pageNumber = this.pageNumber - 1;
  };

  goToNextPage = () => {
    this.pageNumber = this.pageNumber + 1;
  };

  reset = () => {
    this.pageNumber = 0;
    this.selectedZonality = undefined;
    this.selectedType = undefined;
    this.selectedCode = undefined;
    this.selectedCategory = undefined;
  };
}
