import Controller from '@ember/controller';
import { debug } from '@ember/debug';
import { A } from '@ember/array';
export default Controller.extend({
  init() {
    this._super(...arguments);
    this.set('currentSelection', [0, 0]);
    this.set('components', A());
  },
  rawEditor: null,
  highlight: false,
  showContent: true,
  actions: {
    rawEditorInit(editor) {
      this.set('editor', editor);
      window.editor = editor; //Handy to play with
    },
    selectionUpdate() {
      this.set('currentSelection',this.get('rawEditor.currentSelection'));
    },
    handleTextInsert(start, content) {
      debug('text insert');
      debug(start + ' ' + content);
    },
    handleTextRemove(start,end) {
      debug('text remove');
      debug(start + ' ' +  end);
    },
    elementUpdate() {
      debug(this.get('rawEditor.rootNode'));
    },
    reload(){
      window.location.reload(true);
    },
    case1(){
      let selection = this.editor.selectContext([58, 58], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection, {before: {property: ['test:property3'] } });
    },
    case2(){
      let selection = this.editor.selectContext([58, 58], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection, {after: {property: ['test:property3'] } });
    },
    case3(){
      let selection = this.editor.selectContext([58, 58], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection, {after: {property: ['test:property3'], resource: 'http://a/new/resource' } });
    },
    case4(){
      let selection = this.editor.selectContext([58, 58], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection, {after: {property: ['test:property3'], content: 'some content' } });
    },
    case5(){
      let selection = this.editor.selectContext([0, 10000], {resource: 'http://test/editor/update-before-after/Resource1'});
      this.editor.update(selection, {after: {property: 'test:aPropertyFoaf test:anotherPropertyOfFoaf', content: 'some content', typeof: ['test:aShinyNewThing'],
                                             resource:'http://new/resource' } });
    },
    case6(){
      let selection = this.editor.selectContext([0, 10000], {resource: 'http://test/editor/update-before-after/Resource1'});
      this.editor.update(selection, {before: {property: 'test:aPropertyFoaf test:anotherPropertyOfFoaf',
                                             typeof: ['test:aShinyNewThing'],
                                             resource: 'http://new/resource',
                                             innerHTML: `<span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                                         <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                                         <div style='background-color: pink'> and other content </div>`
                                            } });
    },
    case7(){
      let selection = this.editor.selectContext([0, 10000], {resource: 'http://test/editor/update-before-after/Resource1'});
      this.editor.update(selection, {after: {property: 'test:aPropertyFoaf test:anotherPropertyOfFoaf',
                                             typeof: ['test:aShinyNewThing'],
                                             resource: 'http://new/resource',
                                             innerHTML: `
                                             <div style='background-color: red'>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                               <div style='background-color: pink'> and other content </div>
                                                &nbsp;
                                             </div>`
                                            } });
    },
    case8(){
      let selection = this.editor.selectContext([0, 10000], {resource: 'http://test/editor/update-before-after/Resource1'});
      this.editor.update(selection, {after: {innerHTML: `
                                             <div style='background-color: red'>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                               and other content last in list
                                             </div>`
                                            } });
    },
    case9(){
      let selection = this.editor.selectContext([0, 10000], {resource: 'http://test/editor/update-before-after/Resource1'});
      this.editor.update(selection, {after: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                               and other content last in list`
                                            } });
    },
    case10(){
      let selection = this.editor.selectContext([0, 10000], {resource: 'http://test/editor/update-before-after/Resource1'});
      this.editor.update(selection, {before: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                               and other content last in list`
                                            } });
    },
    case11(){
      let selection = this.editor.selectContext([58, 58], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection,  {before: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                               and other content last in list`
                                            } });
    },
    case12(){
      let selection = this.editor.selectContext([58, 58], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection,  {after: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 1</span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'> hello new prop instance 2</span>
                                               and other content last in list`
                                            } });
    },
    case13(){
      let selection = this.editor.selectContext([0, 10000], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection,  {after: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'>
                                                 I am added after the first property 1 (1)
                                               </span>
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'>
                                                I am added after the first property 1 (2)
                                               </span>
                                               and I am the last semanticless (meaningless, so you will) bit`
                                            } });
    },
    case14(){
      let selection = this.editor.selectHighlight([ 55, 70 ]);
      this.editor.update(selection,  { before: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'>
                                                 I will come after 'PR'
                                               </span>`
                                            } });
    },
    case15(){
      let selection = this.editor.selectHighlight([ 55, 70 ]);
      this.editor.update(selection,  { after: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'>
                                                 I will come after 'property 1 instan'
                                               </span>`
                                            } });
    },
    case16(){
      let selection = this.editor.selectContext([ 29, 219 ], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection,  { append: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'>
                                                 I will be nested in first instance property on, last child.
                                               </span>`
                                            } });
    },
    case17(){
      let selection = this.editor.selectContext([ 29, 219 ], {property: 'http://test/editor/update-before-after/property1'});
      this.editor.update(selection,  { prepend: {innerHTML: `
                                               <span property='test:helloNewResourceProp' style='background-color: yellow'>
                                                 I will be nested in first instance property on, first child.
                                               </span>`
                                            } });
    }
  }
});
