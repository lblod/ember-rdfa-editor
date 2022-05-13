import State from '@lblod/ember-rdfa-editor/core/state';
import ModelNode from '../model/model-node';
import NodeView from '../model/node-view';
import HtmlWriter from '../model/writers/html-writer';
import { ModelError } from '../utils/errors';


export interface View {
    domRoot: HTMLElement;
    viewToModelMap: WeakMap<Node, ModelNode>;
    modelToViewMap: WeakMap<ModelNode, NodeView>;
    registerNodeView(modelNode: ModelNode, nodeView: NodeView): void;
    modelToView(modelNode: ModelNode): NodeView | null;
    viewToModel(domNode: Node): ModelNode;
    update(state: State): void;
}
export class EditorView implements View {
    domRoot: HTMLElement;
    viewToModelMap: WeakMap<Node, ModelNode>;
    modelToViewMap: WeakMap<ModelNode, NodeView>;
    constructor(domRoot: HTMLElement) {
        this.viewToModelMap = new WeakMap<Node, ModelNode>();
        this.modelToViewMap = new WeakMap<ModelNode, NodeView>();
        this.domRoot = domRoot;
    }
    /**
     * Bind a modelNode to a domNode. This ensures that we can reach the corresponding node from
     * either side.
     * @param modelNode
     * @param view
     */
    registerNodeView(modelNode: ModelNode, view: NodeView): void {
        this.viewToModelMap.set(view.viewRoot, modelNode);
        this.modelToViewMap.set(modelNode, view);
    }
    modelToView(modelNode: ModelNode): NodeView | null {
        return this.modelToViewMap.get(modelNode) || null;
    }
    viewToModel(domNode: Node): ModelNode {
        let cur: Node | null = domNode;
        let result = null;
        while (cur && !result) {
            result = this.viewToModelMap.get(cur);
            cur = cur.parentNode;
        }
        if (!result) {
            throw new ModelError('Domnode without corresponding modelNode');
        }
        return result;
    }
    update(state: State): void {
        const writer = new HtmlWriter();
        writer.write(this, state.modelRoot);
    }
}
