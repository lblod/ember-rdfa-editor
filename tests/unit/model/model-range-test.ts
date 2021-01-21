import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | model | model-range", () => {

  module("Unit | model | model-range | commonAncestor", () => {
    test("returns null when start and end have different root" , assert => {
      const root = new ModelElement("div");
      const root2 = new ModelElement("div");
      const p1 = ModelPosition.from(root, [0]);
      const p2 = ModelPosition.from(root2, [0]);

      const range = new ModelRange(p1, p2);

      assert.strictEqual(range.getCommonAncestor(), null);
    });
    test("returns root when start and end are root" , assert => {
      const root = new ModelElement("div");
      const p1 = ModelPosition.from(root, []);
      const p2 = ModelPosition.from(root, []);

      const range = new ModelRange(p1, p2);

      assert.true(range.getCommonAncestor()?.sameAs(ModelPosition.from(root, [])));



    });
  });

});
