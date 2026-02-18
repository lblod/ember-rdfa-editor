import type { TOC } from '@ember/component/template-only';

type Signature = {
  Element: HTMLDivElement;
  Blocks: {
    header: [];
    content: [];
  };
};

const DummyContainer: TOC<Signature> = <template>
  <div class="c-dummy" ...attributes>
    <div class="c-dummy__header">
      {{yield to="header"}}
    </div>
    <div
      class="c-dummy__content"
      vocab="http://data.vlaanderen.be/ns/besluit#"
      prefix="eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit#"
    >
      {{yield to="content"}}
    </div>
  </div>
</template>;

export default DummyContainer;
