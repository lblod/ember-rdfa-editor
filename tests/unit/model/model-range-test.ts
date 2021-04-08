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

      const p1 = ModelPosition.fromInTextNode(text, 0);
      const p2 = ModelPosition.fromInTextNode(text, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.true(rslt[0].sameAs(range));

    });
    test("returns range if range is confined2", assert => {
      const root = new ModelElement("div");
      const t1 = new ModelText("abc");
      const div = new ModelElement("div");
      const t2 = new ModelText("def");
      const t3 = new ModelText("ghi");
      root.appendChildren(t1, div, t2, t3);

      const p1 = ModelPosition.fromInTextNode(t1, 0);
      const p2 = ModelPosition.fromInTextNode(t3, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.true(rslt[0].sameAs(range));

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


      const p1 = ModelPosition.fromInTextNode(t00, 0);
      const p2 = ModelPosition.fromInTextNode(t22, 3);
      const range = new ModelRange(p1, p2);
      let rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 3);
      assert.true(rslt[0].sameAs(ModelRange.fromPaths(range.root, [0, 0], [0, 9])));
      assert.true(rslt[0].isConfined());
      assert.true(rslt[1].sameAs(ModelRange.fromPaths(range.root, [1], [2])));
      assert.true(rslt[1].isConfined());
      assert.true(rslt[2].sameAs(ModelRange.fromPaths(range.root, [2, 0], [2, 9])));
      assert.true(rslt[2].isConfined());
      const startInCA = ModelPosition.fromInElement(root, 0);
      const end = ModelPosition.fromInTextNode(t22, 3);
      const rangeWithStartInCA = new ModelRange(startInCA, end);
      rslt = rangeWithStartInCA.getMinimumConfinedRanges();
      assert.strictEqual(rslt.length, 2);
      assert.true(rslt[0].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [0], [2])));
      assert.true(rslt[1].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [2, 0], [2, 9])));

      const start = ModelPosition.fromInTextNode(t00, 0);
      const endInCA = ModelPosition.fromInElement(root, 3);
      const rangeWithEndInCA = new ModelRange(start, endInCA);
      rslt = rangeWithEndInCA.getMinimumConfinedRanges();
      assert.strictEqual(rslt.length, 2);
      assert.true(rslt[0].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [0, 0], [0, 9])));
      assert.true(rslt[1].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [1], [3])));

    });

    test("returns confined ranges with uncles", assert => {
      // language=XML
      const xml = `
        <div>
          <span>
            <span>
              <!--                conf range 1-->
              <text __id="rangeStart">t000</text>
              <text>t001</text>
              <text>t002</text>
              <!--                /conf range 1-->
            </span>
            <!--                conf range 2-->
            <span>
              <text>t010</text>
            </span>
            <!--                /conf range 2-->
          </span>

          <!--                conf range 3-->
          <span/>
          <!--                /conf range 3-->

          <span>
            <!--                conf range 4-->
            <span>
              <text>t200</text>
            </span>
            <!--                /conf range 4-->
            <span>
              <!--                conf range 5-->
              <text>t210</text>
              <text>t211</text>
              <text __id="rangeEnd">t212</text>
              <!--                /conf range 5-->
            </span>
          </span>

          <span/>
        </div>
      `;
      const {textNodes: {rangeStart, rangeEnd}} = parseXml(xml);
      const p1 = ModelPosition.fromInTextNode(rangeStart, 0);
      const p2 = ModelPosition.fromInTextNode(rangeEnd, 2);
      const range = new ModelRange(p1, p2);
      const confinedRanges = range.getMinimumConfinedRanges();

      assert.strictEqual(confinedRanges.length, 5);


    });
  });
  module("Unit | model | model-range | getCommonAncestor", () => {
    test("returns null when start and end have different root", assert => {
      const root = new ModelElement("div");
      const root2 = new ModelElement("div");
      const p1 = ModelPosition.fromPath(root, [0]);
      const p2 = ModelPosition.fromPath(root2, [0]);

      const range = new ModelRange(p1, p2);

      assert.strictEqual(range.getCommonPosition(), null);
    });
    test("returns root when start and end are root", assert => {
      const root = new ModelElement("div");
      const p1 = ModelPosition.fromPath(root, []);
      const p2 = ModelPosition.fromPath(root, []);

      const range = new ModelRange(p1, p2);

      assert.true(range.getCommonPosition()?.sameAs(ModelPosition.fromPath(root, [])));


    });
  });

  module("Unit | model | model-range | getMinimumConfinedRanges", () => {
//     test.skip("doesn't crash", assert => {
//
//     // language=XML
//     const xml = `
//
// <div contenteditable="" class="say-editor__inner say-content"><div property="prov:generated" resource="http://data.lblod.info/id/besluiten/0be6f42c-590e-46d3-92ef-f725680c558f" typeof="besluit:Besluit ext:BesluitNieuweStijl"><text>
//   </text><p><text>Openbare titel besluit:</text></p><text>
//   </text><h4 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual"><text>Geef titel besluit op</text></span></h4><text>
//   </text><span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept"><text> </text></span><text>
//   </text><br/><text>
//   </text><p><text>Korte openbare beschrijving:</text></p><text>
//   </text><p property="eli:description" datatype="xsd:string"><span class="mark-highlight-manual"><text>Geef korte beschrijving op</text></span></p><text>
//   </text><br/><text>
//
//   </text><div property="besluit:motivering" lang="nl"><text>
//     </text><p><text>
//       </text><span class="mark-highlight-manual"><text>geef bestuursorgaan op</text></span><text>,
//     </text></p><text>
//     </text><br/><text>
//
//     </text><h5><text>Bevoegdheid</text></h5><text>
//     </text><ul class="bullet-list"><li><span class="mark-highlight-manual"><text>Rechtsgrond die bepaald dat dit orgaan bevoegd is.</text></span></li></ul><text>
//     </text><br/><text>
//
//     </text><h5><text>Juridische context</text></h5><text>
//     </text><ul class="bullet-list"><li><span class="mark-highlight-manual"><text>Voeg juridische context in</text></span></li></ul><text>
//     </text><br/><text>
//
//     </text><h5><text>Feitelijke context en argumentatie</text></h5><text>
//     </text><ul class="bullet-list"><li><span class="mark-highlight-manual"><text>Voeg context en argumentatie in</text></span></li></ul><text>
//   </text></div><text>
//   </text><br/><text>
//   </text><br/><text>
//
//   </text><h5><text>Beslissing</text></h5><text>
//
//   </text><div property="prov:value" datatype="xsd:string"><text>
//     </text><div property="eli:has_part" resource="http://data.lblod.info/artikels/814b58fc-d8be-4890-ad36-781fc8b34a82" typeof="besluit:Artikel"><text>
//       </text><div property="eli:number" datatype="xsd:string"><text>Artikel 1</text></div><text>
//       </text><span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept"><text> </text></span><text>
//       </text><div property="prov:value" datatype="xsd:string"><text>
//         </text><span class="mark-highlight-manual"><text>Voer inhoud in</text></span><text>
//       </text></div><text>
//     </text></div><text>
//     </text><br/><text>
//     </text><div class="mark-highlight-manual"><text highlighted="true">Voeg nieuw artikel in</text></div><text>
//     </text><br/><text>
//   </text></div><text>
//
// </text></div><text>
// </text></div>
// `;
//     const { root, textNodes: {rangeStart, rangeEnd}} = parseXml(xml);
//     const range = ModelRange.fromPaths(root as ModelElement, [0, 50, 17], [0, 50, 17, 21]);
//     const ranges = range.getMinimumConfinedRanges();
//     // TODO add asserts
//       assert.true(true);
//
//     });
  });

  module("Unit | model | model-range | getMaximizedRange", () => {
    test("gets the same range when start and end in commonAncestor", assert => {
      // language=XML
      const xml = `
        <div>
          <span><text __id="testNode">test</text></span>
        </div>
      `;
      const {textNodes: {testNode}} = parseXml(xml);


      const start = ModelPosition.fromInTextNode(testNode, 0);
      const end = ModelPosition.fromInTextNode(testNode, 3);
      const range = new ModelRange(start, end);

      const maximized = range.getMaximizedRange();
      assert.true(range.sameAs(maximized));

    });
    test("gets the maximized range", assert => {
      // language=XML
      const xml = `
        <div>
          <span __id="commonAncestor">
            <span>
              <text __id="rangeStart">start</text>
            </span>

            <span>
              <text>middle</text>
            </span>

            <span>
              <text __id="rangeEnd">end</text>
            </span>
          </span>
        </div>
      `;

      const {textNodes: {rangeStart, rangeEnd}} = parseXml(xml);

      const start = ModelPosition.fromInTextNode(rangeStart, 0);
      const end = ModelPosition.fromInTextNode(rangeEnd, 3);

      const range = new ModelRange(start, end);
      assert.deepEqual(range.start.path, [0, 0, 0]);
      assert.deepEqual(range.end.path, [0, 2, 3]);

      const maximized = range.getMaximizedRange();
      assert.deepEqual(maximized.start.path, [0, 0]);
      assert.deepEqual(maximized.end.path, [0, 3]);

    });

  });
});
