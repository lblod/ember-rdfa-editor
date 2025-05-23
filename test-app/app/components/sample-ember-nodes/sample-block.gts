import type { TOC } from '@ember/component/template-only';

interface Signature {
  Blocks: {
    default: [];
  };
}

const SampleBlock: TOC<Signature> = <template>
  <div class="say-dummy-sample-block">
    <div>
      {{yield}}
    </div>
  </div>
</template>;

export default SampleBlock;
