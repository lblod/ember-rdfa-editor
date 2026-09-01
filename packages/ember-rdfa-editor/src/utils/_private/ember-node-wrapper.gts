import type Owner from '@ember/owner';
import { renderComponent } from '@ember/renderer';
import type { ComponentLike } from '@glint/template';
import type { EmberNodeArgs } from './ember-node';
import EmberNodeSlot from '#root/components/ember-node/slot.gts';
import type { TOC } from '@ember/component/template-only';

export type EmberNodeWrapperArgs = EmberNodeArgs & {
  atom?: boolean;
  contentDOM?: HTMLElement;
};
export interface EmberNodeSig {
  Args: EmberNodeWrapperArgs;
}

const Wrapper: TOC<{
  Args: EmberNodeWrapperArgs & { comp: ComponentLike<EmberNodeWrapperArgs> };
}> = <template>
  <@comp
    @getPos={{@getPos}}
    @node={{@node}}
    @updateAttribute={{@updateAttribute}}
    @controller={{@controller}}
    @view={{@view}}
    @selected={{@selected}}
    @contentDecorations={{@contentDecorations}}
    @selectNode={{@selectNode}}
  >
    {{#unless @atom}}
      {{#if @contentDOM}}
        <EmberNodeSlot @contentDOM={{@contentDOM}} />
      {{/if}}
    {{/unless}}
  </@comp>
</template>;

interface RenderEmberNodeArgs {
  owner: Owner;
  into: HTMLElement;
  args: EmberNodeSig['Args'] & Record<string, unknown>;
  comp: ComponentLike<EmberNodeSig>;
}
export function renderEmberNode({
  owner,
  into,
  args,
  comp,
}: RenderEmberNodeArgs): {
  node: HTMLElement;
  comp: ComponentLike<EmberNodeSig>;
  renderResult: ReturnType<typeof renderComponent>;
} {
  const renderResult = renderComponent(Wrapper, {
    owner,
    into,
    args,
    env: { isInteractive: true },
  });
  return { node: into, comp, renderResult };
}
