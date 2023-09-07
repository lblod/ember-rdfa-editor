import templateOnlyComponent from '@ember/component/template-only';

interface Signature {
  Blocks: {
    default: [];
  };
}

const Card = templateOnlyComponent<Signature>();

export default Card;
