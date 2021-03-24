import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {parseXml} from "@lblod/ember-rdfa-editor/model/util/xml-utils";

module("Unit | model | model-range", () => {

  module("Unit | model | model-range | getMinimumConfinedRanges", () => {

    test("returns range if range is confined", assert => {
      const root = new ModelElement("div");
      const text = new ModelText("abc");
      root.addChild(text);

      const p1 = ModelPosition.inTextNode(text, 0);
      const p2 = ModelPosition.inTextNode(text, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.strictEqual(rslt[0], range);

    });
    test("returns range if range is confined2", assert => {
      const root = new ModelElement("div");
      const t1 = new ModelText("abc");
      const div = new ModelElement("div");
      const t2 = new ModelText("def");
      const t3 = new ModelText("ghi");
      root.appendChildren(t1, div, t2, t3);

      const p1 = ModelPosition.inTextNode(t1, 0);
      const p2 = ModelPosition.inTextNode(t3, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.strictEqual(rslt[0], range);

    });

    test("returns confined ranges", assert => {
      const root = new ModelElement("div");

      const s0 = new ModelElement("span");
      const t00 = new ModelText("t00");
      const t01 = new ModelText("t01");
      const t02 = new ModelText("t02");


      const s1 = new ModelElement("span");

      const s2 = new ModelElement("span");
      const t20 = new ModelText("t20");
      const t21 = new ModelText("t21");
      const t22 = new ModelText("t22");

      const s3 = new ModelElement("span");

      root.appendChildren(s0, s1, s2, s3);
      s0.appendChildren(t00, t01, t02);
      s2.appendChildren(t20, t21, t22);


      const p1 = ModelPosition.inTextNode(t00, 0);
      const p2 = ModelPosition.inTextNode(t22, 3);
      const range = new ModelRange(p1, p2);
      let rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 3);
      assert.ok(rslt[0].sameAs(ModelRange.fromPaths(range.root, [0, 0], [0, 9])));
      assert.ok(rslt[0].isConfined());
      assert.ok(rslt[1].sameAs(ModelRange.fromPaths(range.root, [1], [2])));
      assert.ok(rslt[1].isConfined());
      assert.ok(rslt[2].sameAs(ModelRange.fromPaths(range.root, [2, 0], [2, 9])));
      assert.ok(rslt[2].isConfined());
      const startInCA = ModelPosition.inElement(root, 0);
      const end = ModelPosition.inTextNode(t22, 3);
      const rangeWithStartInCA = new ModelRange(startInCA, end);
      rslt = rangeWithStartInCA.getMinimumConfinedRanges();
      assert.strictEqual(rslt.length, 2);
      assert.ok(rslt[0].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [0], [2])));
      assert.ok(rslt[1].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [2, 0], [2, 9])));

      const start = ModelPosition.inTextNode(t00, 0);
      const endInCA = ModelPosition.inElement(root, 3);
      const rangeWithEndInCA = new ModelRange(start, endInCA);
      rslt = rangeWithEndInCA.getMinimumConfinedRanges();
      assert.strictEqual(rslt.length, 2);
      assert.ok(rslt[0].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [0, 0], [0, 9])));
      assert.ok(rslt[1].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [1], [3])));

    });

    test("returns confined ranges with uncles", assert => {
      // language=XML
      const xml = `
        <div>
          <span>
            <span>
              <text __id="rangeStart">t000</text>
              <text>t001</text>
              <text>t002</text>
            </span>
            <span>
              <text>t010</text>
            </span>
          </span>

          <span/>

          <span>
            <text>t20</text>
            <text>t21</text>
            <text __id="rangeEnd">t22</text>
          </span>

          <span/>
        </div>
      `;
      const {textNodes: {rangeStart, rangeEnd}} = parseXml(xml);


    });
  });
  module("Unit | model | model-range | getCommonAncestor", () => {
    test("returns null when start and end have different root", assert => {
      const root = new ModelElement("div");
      const root2 = new ModelElement("div");
      const p1 = ModelPosition.from(root, [0]);
      const p2 = ModelPosition.from(root2, [0]);

      const range = new ModelRange(p1, p2);

      assert.strictEqual(range.getCommonPosition(), null);
    });
    test("returns root when start and end are root", assert => {
      const root = new ModelElement("div");
      const p1 = ModelPosition.from(root, []);
      const p2 = ModelPosition.from(root, []);

      const range = new ModelRange(p1, p2);

      assert.true(range.getCommonPosition()?.sameAs(ModelPosition.from(root, [])));


    });
  });

});
