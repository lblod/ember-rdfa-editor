import Component from '@glimmer/component';
import { get } from '@ember/helper';
import type { ComponentLike } from '@glint/template';
import type { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
import {
  type DisplayElement,
  type DisplayGenerator,
  type DisplayMeta,
  type GeneratorContext,
} from '#root/plugins/rdfa-info/types.ts';

interface HTMLElementSig {
  Blocks: {
    default: [];
  };
  Element: HTMLElement;
}
const Span: TemplateOnlyComponent<HTMLElementSig> = <template>
  <span ...attributes>{{yield}}</span>
</template>;

export const predicateDisplay: DisplayGenerator<OutgoingTriple> = (triple) => {
  return [{ strong: 'predicate:' }, triple.predicate];
};

interface Sig<T> {
  Args: {
    context: GeneratorContext;
    value: T;
    generator: DisplayGenerator<T>;
    wrapper?: ComponentLike<HTMLElementSig>;
  };
  Blocks: {
    default: [];
  };
}

export default class ConfigurableRdfaDisplay<T> extends Component<Sig<T>> {
  elementConfig = trackedFunction(this, () => {
    return this.args.generator(this.args.value, this.args.context);
  });
  get elements(): DisplayElement[] {
    const conf = this.elementConfig.value;
    if (!conf) return [];
    return 'elements' in conf ? conf.elements : conf;
  }
  get meta(): DisplayMeta {
    const conf = this.elementConfig.value;
    if (!conf) return {};
    return 'meta' in conf ? conf.meta : {};
  }
  get isHidden(): boolean {
    return this.elements.some(
      (element) => typeof element !== 'string' && 'hidden' in element,
    );
  }
  get wrapperComponent() {
    return this.args.wrapper ?? Span;
  }

  <template>
    {{#unless this.isHidden}}
      {{#let this.wrapperComponent as |Wrapper|}}
        <Wrapper title={{this.meta.title}}>
          {{#if this.elementConfig.isLoading}}
            <AuLoader @hideMessage={{true}}>
              {{t "ember-rdfa-editor.utils.loading"}}
            </AuLoader>
          {{else}}
            {{#each this.elements as |element|}}
              {{#if (get element "strong")}}
                {{! @glint-expect-error}}
                <strong>{{element.strong}}</strong>
              {{else if (get element "pill")}}
                {{! @glint-expect-error}}
                <AuPill @size="small">{{element.pill}}</AuPill>
              {{else}}
                {{! @glint-expect-error}}
                {{element}}
              {{/if}}
            {{/each}}
          {{/if}}
          {{yield}}
        </Wrapper>
      {{/let}}
    {{/unless}}
  </template>
}
