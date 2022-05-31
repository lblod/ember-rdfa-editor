import Component from '@glimmer/component';

export default class InlineComponentsRegulatoryAttachment extends Component {
  get title() {
    return 'Subsidiereglement voor het organiseren van buurtactiviteiten';
  }

  get articles() {
    return [
      'Doel',
      'Definities',
      'Welke kosten komen in aanmerking voor subsidiëring?',
      'Welke kosten komen niet in aanmerking voor subsidiëring?',
      'Doelgroep',
      'Welke activiteiten zijn uitgesloten voor het bekomen van deze subsidie?',
      'Algemene voorwaarden',
      'Procedure aanvraag',
    ];
  }
}
