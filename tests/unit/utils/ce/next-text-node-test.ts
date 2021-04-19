import ceNextTextNode from "dummy/utils/ce/next-text-node";
import { module, test, skip } from "qunit";

const invisibleSpace = "\u200B";

module("Unit | Utility | ce/next-text-node", function () {
  test("returns null when textNode is rootNode", function (assert) {
    const root = document.createElement("div");
    const result = ceNextTextNode(root, root);
    assert.strictEqual(result, null);
  });
  test("returns null when nextNode is rootNode", function (assert) {
    const root = document.createElement("div");
    const child = document.createElement("div");
    root.appendChild(child);
    const result = ceNextTextNode(child, root);
    assert.strictEqual(result, null);
  });
  skip("inserts a new node after the current node if next node is not a text node", async function (assert) {
    const root = document.createElement("div");
    const child1 = document.createElement("div");
    const child2 = document.createElement("div");
    root.appendChild(child1);
    root.appendChild(child2);
    const result = ceNextTextNode(child1, root);
    assert.notEqual(root, result);
    assert.notEqual(child1, result);
    assert.notEqual(child2, result);
    assert.strictEqual(result.nodeType, Node.TEXT_NODE);
    assert.strictEqual(result.textContent, invisibleSpace);
  });
  skip("returns next node if it is a text node", async function (assert) {
    const root = document.createElement("div");
    const child1 = new Text("child1");
    const child2 = new Text("child2");

    root.appendChild(child1);
    root.appendChild(child2);

    const result = ceNextTextNode(child1, root);
    assert.strictEqual(result, child2);
  });
  test("returns next node if it is a text node nested", async function (assert) {
    const root = document.createElement("div");
    const complex_html = `
<div>
  div
  <ul class="test">
    ul
    <li>li1</li>
    <li>li2</li>
    <li>li3</li>
    <li>
      li4
      <div>
        li4 div
        <p>li4 div p</p>
      </div>
    </li>
  </ul>
  <table>
    div table
    <th>div table th</th>
    <tr>
      tr1
      <tb>tr1 tb1</tb>
      <tb>tr1 tb2</tb>
      <tb>tr1 tb3</tb>
    </tr>

    <tr>
      tr2
      <tb>tr2 tb1</tb>
      <tb>tr2 tb2</tb>
      <tb>tr2 tb3</tb>
    </tr>
  </table>
</div>
`;

    root.insertAdjacentHTML("beforeend", complex_html);
    const startNode = root.getElementsByClassName("test")[0].childNodes[0];

    const result = ceNextTextNode(startNode, root);
    assert.strictEqual(result.textContent, "li1");
  });
});
