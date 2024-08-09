import { type TemplateOnlyComponent } from '@ember/component/template-only';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';

interface Signature {
  Blocks: {
    default: [];
  };
}

const Card: TemplateOnlyComponent<Signature> = <template>
  <AuCard @flex={{true}} as |c|>
    <c.header contenteditable='false'>
      <AuHeading @level='2' @skin='4'>
        Title
      </AuHeading>
      <p>
        Subtitle
      </p>
    </c.header>
    <c.content>
      {{yield}}
    </c.content>
  </AuCard>
</template>;

export default Card;
