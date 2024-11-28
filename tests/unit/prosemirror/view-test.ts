import { module, test } from 'qunit';
import TEST_SCHEMA from 'dummy/tests/test-utils';
import { EditorState, SayView } from '@lblod/ember-rdfa-editor';
import { oneLineTrim } from 'common-tags';

module('ProseMirror | view', function () {
  test('setHtmlContent without a supplied range should replace the whole content of the document', function (assert) {
    const schema = TEST_SCHEMA;

    const view = new SayView(null, {
      state: EditorState.create({ schema }),
    });
    const htmlToInsert = oneLineTrim`
    <div lang="en-US" data-say-document="true">
      <div style="display: none" class="say-hidden" data-rdfa-container="true"></div>
      <div data-content-container="true">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
           Fusce euismod mauris in lacus mollis, eu laoreet risus sollicitudin.
           Donec tincidunt dolor quis dignissim tincidunt.
        </p>
        <p>
           Suspendisse molestie ipsum odio, ac dignissim odio vestibulum ut.
           Ut facilisis purus et blandit posuere.
           Mauris vitae neque bibendum, rutrum leo ac, euismod magna.
        </p>
        <p>
           Maecenas non eros et sem sodales ultricies.
           Cras a tortor nec ante accumsan imperdiet ut eu nisi.
           Morbi placerat leo vitae quam tincidunt venenatis.
           Pellentesque neque magna, dignissim vitae faucibus eu, dignissim vitae urna.
           Aenean dolor ipsum, rutrum at gravida sit amet, fringilla et erat.
        </p>
      </div>
    </div>
    `;

    const expectedHtml = oneLineTrim`
    <div lang="en-US" data-say-document="true">
      <div style="display: none" class="say-hidden" data-rdfa-container="true"></div>
      <div data-content-container="true">
        <p class="say-paragraph">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
           Fusce euismod mauris in lacus mollis, eu laoreet risus sollicitudin.
           Donec tincidunt dolor quis dignissim tincidunt.
        </p>
        <p class="say-paragraph">
           Suspendisse molestie ipsum odio, ac dignissim odio vestibulum ut.
           Ut facilisis purus et blandit posuere.
           Mauris vitae neque bibendum, rutrum leo ac, euismod magna.
        </p>
        <p class="say-paragraph">
           Maecenas non eros et sem sodales ultricies.
           Cras a tortor nec ante accumsan imperdiet ut eu nisi.
           Morbi placerat leo vitae quam tincidunt venenatis.
           Pellentesque neque magna, dignissim vitae faucibus eu, dignissim vitae urna.
           Aenean dolor ipsum, rutrum at gravida sit amet, fringilla et erat.
        </p>
      </div>
    </div>
    `;
    view.setHtmlContent(htmlToInsert);
    assert.strictEqual(view.htmlContent, expectedHtml);
  });
  test('setHtmlContent should be able to replace a specific range when specified', function (assert) {
    const schema = TEST_SCHEMA;

    const view = new SayView(null, {
      state: EditorState.create({ schema }),
    });
    const htmlToInsert = oneLineTrim`
    <div lang="en-US" data-say-document="true">
      <div style="display: none" data-rdfa-container="true"></div>
      <div data-content-container="true">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
           Fusce euismod mauris in lacus mollis, eu laoreet risus sollicitudin.
           Donec tincidunt dolor quis dignissim tincidunt.
        </p>
        <p>
           Suspendisse molestie ipsum odio, ac dignissim odio vestibulum ut.
           Ut facilisis purus et blandit posuere.
           Mauris vitae neque bibendum, rutrum leo ac, euismod magna.
        </p>
        <p>
           Maecenas non eros et sem sodales ultricies.
           Cras a tortor nec ante accumsan imperdiet ut eu nisi.
           Morbi placerat leo vitae quam tincidunt venenatis.
           Pellentesque neque magna, dignissim vitae faucibus eu, dignissim vitae urna.
           Aenean dolor ipsum, rutrum at gravida sit amet, fringilla et erat.
        </p>
      </div>
    </div>
    `;
    const expectedHtml = oneLineTrim`
    <div lang="en-US" data-say-document="true">
      <div style="display: none" class="say-hidden" data-rdfa-container="true"></div>
      <div data-content-container="true">
        <p class="say-paragraph">Lorem ips<strong>um dolor s</strong>
        </p>
        <p class="say-paragraph">new paragraph it amet, consectetur adipiscing elit.
           Fusce euismod mauris in lacus mollis, eu laoreet risus sollicitudin.
           Donec tincidunt dolor quis dignissim tincidunt.
        </p>
        <p class="say-paragraph">
           Suspendisse molestie ipsum odio, ac dignissim odio vestibulum ut.
           Ut facilisis purus et blandit posuere.
           Mauris vitae neque bibendum, rutrum leo ac, euismod magna.
        </p>
        <p class="say-paragraph">
           Maecenas non eros et sem sodales ultricies.
           Cras a tortor nec ante accumsan imperdiet ut eu nisi.
           Morbi placerat leo vitae quam tincidunt venenatis.
           Pellentesque neque magna, dignissim vitae faucibus eu, dignissim vitae urna.
           Aenean dolor ipsum, rutrum at gravida sit amet, fringilla et erat.
        </p>
      </div>
    </div>
    `;
    view.setHtmlContent(htmlToInsert);

    view.setHtmlContent('<strong>um dolor s</strong><p>new paragraph </p>', {
      range: { from: 10, to: 20 },
    });
    assert.strictEqual(view.htmlContent, expectedHtml);
  });

  test('setHtmlContent will leave not clean the HTML if asked not to', function (assert) {
    const schema = TEST_SCHEMA;

    const view = new SayView(null, {
      state: EditorState.create({ schema }),
    });
    const htmlToInsert = oneLineTrim`
    <div lang="en-US" data-say-document="true">
      <div style="display: none" class="say-hidden" data-rdfa-container="true"></div>
      <div data-content-container="true">
        <p>   </p>
        <p>
           Suspendisse molestie ipsum odio, ac dignissim odio vestibulum ut.
           Ut facilisis purus et blandit posuere.
           Mauris vitae neque bibendum, rutrum leo ac, euismod magna.
        </p>
        <p></p>
      </div>
    </div>
    `;
    const expectedHtml = oneLineTrim`
    <div lang="en-US" data-say-document="true">
      <div style="display: none" class="say-hidden" data-rdfa-container="true"></div>
      <div data-content-container="true">
        <p class="say-paragraph">   </p>
        <p class="say-paragraph">
           Suspendisse molestie ipsum odio, ac dignissim odio vestibulum ut.
           Ut facilisis purus et blandit posuere.
           Mauris vitae neque bibendum, rutrum leo ac, euismod magna.
        </p>
        <p class="say-paragraph"></p>
      </div>
    </div>
    `;
    view.setHtmlContent(htmlToInsert, { doNotClean: true });
    assert.strictEqual(view.htmlContent, expectedHtml);
  });
});
