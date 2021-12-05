import NodeWalker from '@lblod/marawa/node-walker';
import RichNode from '@lblod/marawa/rich-node';

export default {
  create() {
    return new NodeWalker();
  },
};

export { RichNode };
