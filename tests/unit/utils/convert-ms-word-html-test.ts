import { module, test } from 'qunit';
import { oneLineTrim } from 'common-tags';
import { convertMsWordHtml } from '@lblod/ember-rdfa-editor/utils/ce/paste-handler-func';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/html-input-parser';

module('Utils | CS | paste-handler | convertMsWordHtml', function () {
  test('It should handle rtf -> html correctly', function (assert) {
    const expectedHtml = oneLineTrim`
        <span>Lorem Ipsum</span>
    `;
    const htmlContent = oneLineTrim`
     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
       <head>
          <meta http-equiv=Content-Type content="text/html; charset=utf-8">
          <meta name=ProgId content=Word.Document>
          <meta name=Generator content="Microsoft Word 15">
          <meta name=Originator content="Microsoft Word 15">
       </head>
       <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
          <!--StartFragment--><span style='font-size:14.0pt;font-family:"Calibri",sans-serif; mso-ascii-theme-font:minor-latin;mso-fareast-font-family:Calibri;mso-fareast-theme-font: minor-latin;mso-hansi-theme-font:minor-latin;mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi;mso-ansi-language:#0C00;mso-fareast-language: EN-US;mso-bidi-language:AR-SA'>Lorem Ipsum</span><!--EndFragment-->
       </body>
    </html>
    `;

    const inputParser = new HTMLInputParser({});
    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);

    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('It should display formatted list as HTML', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
    <ul>
     <li><span>Feature</span><span>1</span></li>
     <li><span>Feature</span><span>2</span></li>
    </ul>
    `;
    const htmlContent = oneLineTrim`
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
         <head>
            <meta http-equiv=Content-Type content="text/html; charset=utf-8">
            <meta name=ProgId content=Word.Document>
            <meta name=Generator content="Microsoft Word 15">
            <meta name=Originator content="Microsoft Word 15">
         </head>
         <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
            <!--StartFragment-->
            <p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
               <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:14.0pt; mso-ansi-language:EN-US'>Feature</span><span lang=EN-US style='font-size:14.0pt'> </span><span lang=EN-US style='font-size:14.0pt;mso-ansi-language:EN-US'>1</span>
               <span lang=EN-US style='font-size:20.0pt;mso-ansi-language:EN-US'>
                  <o:p></o:p>
               </span>
            </p>
            <p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
               <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:14.0pt; mso-ansi-language:EN-US'>Feature</span><span lang=EN-US style='font-size:14.0pt'> </span><span lang=EN-US style='font-size:14.0pt;mso-ansi-language:EN-US'>2</span>
               <span lang=EN-US style='font-size:20.0pt;mso-ansi-language:EN-US'>
                  <o:p></o:p>
               </span>
            </p>
            <!--EndFragment-->
         </body>
      </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('It should display formatted table as HTML', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
     <table property="http://lblod.data.gift/vocabularies/editor/isLumpNode" cellspacing="0">
       <tbody>
          <tr>
             <td>
                <p><span>Column 1</span></p>
             </td>
             <td>
                <p><span>Column 2</span></p>
             </td>
             <td>
                <p><span>Column 3</span></p>
             </td>
             <td>
                <p><span>Column4</span></p>
             </td>
          </tr>
          <tr>
             <td>
                <p><span>Test1</span></p>
             </td>
             <td>
                <p><span>Test2</span></p>
             </td>
             <td>
                <p><span>Test3</span></p>
             </td>
             <td>
                <p><span>Test4</span></p>
             </td>
          </tr>
          <tr>
             <td>
                <p><span>Test5</span></p>
             </td>
             <td>
                <p><span>Test6</span></p>
             </td>
             <td>
                <p><span>Test7</span></p>
             </td>
             <td>
                <p><span>Test8</span></p>
             </td>
          </tr>
          <tr>
             <td>
                <p><span>Test9</span></p>
             </td>
             <td>
                <p><span>Test10</span></p>
             </td>
             <td>
                <p><span>Test11</span></p>
             </td>
             <td>
                <p><span>Test12</span></p>
             </td>
          </tr>
       </tbody>
    </table>
    `;
    const htmlContent = oneLineTrim`
     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
       <head>
          <meta http-equiv=Content-Type content="text/html; charset=utf-8">
          <meta name=ProgId content=Word.Document>
          <meta name=Generator content="Microsoft Word 15">
          <meta name=Originator content="Microsoft Word 15">
       </head>
       <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
          <!--StartFragment-->
          <table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none;mso-border-alt:solid windowtext .5pt; mso-yfti-tbllook:1184;mso-padding-alt:0cm 5.4pt 0cm 5.4pt'>
             <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes'>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Column 1
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Column 2
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Column 3
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Column4
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
             </tr>
             <tr style='mso-yfti-irow:1'>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test1
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test2
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test3
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test4
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
             </tr>
             <tr style='mso-yfti-irow:2'>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test5
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test6
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test7
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test8
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
             </tr>
             <tr style='mso-yfti-irow:3;mso-yfti-lastrow:yes'>
                <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test9
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test10
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test11
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
                <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                   <p class=MsoNormal>
                      <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                         Test12
                         <o:p></o:p>
                      </span>
                   </p>
                </td>
             </tr>
          </table>
          <!--EndFragment-->
       </body>
    </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('It should display bold text', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
        <p><strong><span>Lorem Ipsum Bold</span></strong></p>
    `;
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
       <head>
          <meta http-equiv=Content-Type content="text/html; charset=utf-8">
          <meta name=ProgId content=Word.Document>
          <meta name=Generator content="Microsoft Word 15">
          <meta name=Originator content="Microsoft Word 15">
       </head>
       <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
          <!--StartFragment-->
          <p class=MsoNormal>
             <b>
                <span lang=EN-US style='font-size:14.0pt;mso-ansi-language: EN-US'>
                   Lorem Ipsum Bold
                   <o:p></o:p>
                </span>
             </b>
          </p>
          <!--EndFragment-->
       </body>
    </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml.trim(), actualHtml.trim());
  });

  test('It should display italic text', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
        <p><em><span>Lorem Ipsum Bold</span></em></p>
    `;
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
       <head>
          <meta http-equiv=Content-Type content="text/html; charset=utf-8">
          <meta name=ProgId content=Word.Document>
          <meta name=Generator content="Microsoft Word 15">
          <meta name=Originator content="Microsoft Word 15">
       </head>
       <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
          <!--StartFragment-->
          <p class=MsoNormal>
             <i>
                <span lang=EN-US style='font-size:14.0pt;mso-ansi-language: EN-US'>
                   Lorem Ipsum Bold
                   <o:p></o:p>
                </span>
             </i>
          </p>
          <!--EndFragment-->
       </body>
    </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('It should display underlined text', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
        <p><u><span>Lorem Ipsum Bold</span></u></p>
    `;
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
       <head>
          <meta http-equiv=Content-Type content="text/html; charset=utf-8">
          <meta name=ProgId content=Word.Document>
          <meta name=Generator content="Microsoft Word 15">
          <meta name=Originator content="Microsoft Word 15">
       </head>
       <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
          <!--StartFragment-->
          <p class=MsoNormal>
             <u>
                <span lang=EN-US style='font-size:14.0pt;mso-ansi-language: EN-US'>
                   Lorem Ipsum Bold
                   <o:p></o:p>
                </span>
             </u>
          </p>
          <!--EndFragment-->
       </body>
    </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('It should display formatted list in a table', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
    <table property="http://lblod.data.gift/vocabularies/editor/isLumpNode" cellspacing="0">
         <tbody>
            <tr>
               <td>
                  <p><span>Column 1</span></p>
               </td>
               <td>
                  <p><span>Column 2</span></p>
               </td>
               <td>
                  <p><span>Column 3</span></p>
               </td>
               <td>
                  <p><span>Column4</span></p>
               </td>
            </tr>
            <tr>
               <td>
                  <ul>
                     <li><span>List 1</span></li>
                     <li><span>List 2</span></li>
                  </ul>
               </td>
               <td>
                  <p><span>Test2</span></p>
               </td>
               <td>
                  <p><span>Test3</span></p>
               </td>
               <td>
                  <p><span>Test4</span></p>
               </td>
            </tr>
            <tr>
               <td>
                  <p><span>Test5</span></p>
               </td>
               <td>
                  <p><span>Test6</span></p>
               </td>
               <td>
                  <ul>
                     <li><span>List 3</span></li>
                     <li><span>List 4</span></li>
                  </ul>
               </td>
               <td>
                  <p><span>Test8</span></p>
               </td>
            </tr>
         </tbody>
      </table>
    `;
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
         <head>
            <meta http-equiv=Content-Type content="text/html; charset=utf-8">
            <meta name=ProgId content=Word.Document>
            <meta name=Generator content="Microsoft Word 15">
            <meta name=Originator content="Microsoft Word 15">
         </head>
         <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
            <!--StartFragment-->
            <table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none;mso-border-alt:solid windowtext .5pt; mso-yfti-tbllook:1184;mso-padding-alt:0cm 5.4pt 0cm 5.4pt'>
               <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes'>
                  <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Column 1
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Column 2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Column 3
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Column4
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
               <tr style='mso-yfti-irow:1'>
                  <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
                        <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
                        <span lang=EN-US style='font-size:20.0pt; mso-ansi-language:EN-US'>
                           List 1
                           <o:p></o:p>
                        </span>
                     </p>
                     <p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
                        <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
                        <span lang=EN-US style='font-size:20.0pt; mso-ansi-language:EN-US'>
                           List 2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Test2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Test3
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Test4
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
               <tr style='mso-yfti-irow:2;mso-yfti-lastrow:yes'>
                  <td width=150 valign=top style='width:112.7pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Test5
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Test6
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l1 level1 lfo2'>
                        <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
                        <span lang=EN-US style='font-size:20.0pt; mso-ansi-language:EN-US'>
                           List 3
                           <o:p></o:p>
                        </span>
                     </p>
                     <p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l1 level1 lfo2'>
                        <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
                        <span lang=EN-US style='font-size:20.0pt; mso-ansi-language:EN-US'>
                           List 4
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=150 valign=top style='width:112.7pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Test8
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
            </table>
            <!--EndFragment-->
         </body>
      </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('It should display table in a list', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
     <ul>
       <li><span>List table 1</span></li>
    </ul>
    <table property="http://lblod.data.gift/vocabularies/editor/isLumpNode" cellspacing="0">
       <tbody>
          <tr>
             <td>
                <p><span>Table column 1</span></p>
             </td>
             <td>
                <p><span>Table column 2</span></p>
             </td>
          </tr>
          <tr>
             <td>
                <p><span>Data 1</span></p>
             </td>
             <td>
                <p><span>Data2</span></p>
             </td>
          </tr>
       </tbody>
    </table>
    <ul>
       <li><span>List table 2</span></li>
    </ul>
    <table property="http://lblod.data.gift/vocabularies/editor/isLumpNode" cellspacing="0">
       <tbody>
          <tr>
             <td>
                <p><span>Table column 1</span></p>
             </td>
             <td>
                <p><span>Table column 2</span></p>
             </td>
          </tr>
          <tr>
             <td>
                <p><span>Data 1</span></p>
             </td>
             <td>
                <p><span>Data 2</span></p>
             </td>
          </tr>
       </tbody>
    </table>
    `;
    const htmlContent = oneLineTrim`
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
         <head>
            <meta http-equiv=Content-Type content="text/html; charset=utf-8">
            <meta name=ProgId content=Word.Document>
            <meta name=Generator content="Microsoft Word 15">
            <meta name=Originator content="Microsoft Word 15">
         </head>
         <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
            <!--StartFragment-->
            <p class=MsoListParagraph style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
               <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
               <span lang=EN-US style='font-size:20.0pt; mso-ansi-language:EN-US'>
                  List table 1
                  <o:p></o:p>
               </span>
            </p>
            <table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none;mso-border-alt:solid windowtext .5pt; mso-yfti-tbllook:1184;mso-padding-alt:0cm 5.4pt 0cm 5.4pt'>
               <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes'>
                  <td width=301 valign=top style='width:225.4pt;border:solid windowtext 1.0pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Table column 1
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=301 valign=top style='width:225.4pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Table column 2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
               <tr style='mso-yfti-irow:1;mso-yfti-lastrow:yes'>
                  <td width=301 valign=top style='width:225.4pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Data 1
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=301 valign=top style='width:225.4pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Data2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
            </table>
            <p class=MsoListParagraph style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
               <![if !supportLists]><span lang=EN-US style='font-size:20.0pt;font-family:Symbol;mso-fareast-font-family: Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
               <span lang=EN-US style='font-size:20.0pt; mso-ansi-language:EN-US'>
                  List table 2
                  <o:p></o:p>
               </span>
            </p>
            <table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none;mso-border-alt:solid windowtext .5pt; mso-yfti-tbllook:1184;mso-padding-alt:0cm 5.4pt 0cm 5.4pt'>
               <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes'>
                  <td width=301 valign=top style='width:225.4pt;border:solid windowtext 1.0pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Table column 1
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=301 valign=top style='width:225.4pt;border:solid windowtext 1.0pt; border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt: solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Table column 2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
               <tr style='mso-yfti-irow:1;mso-yfti-lastrow:yes'>
                  <td width=301 valign=top style='width:225.4pt;border:solid windowtext 1.0pt; border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt; padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Data 1
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
                  <td width=301 valign=top style='width:225.4pt;border-top:none;border-left: none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt; mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt; mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt'>
                     <p class=MsoNormal>
                        <span lang=EN-US style='font-size:20.0pt;mso-ansi-language: EN-US'>
                           Data 2
                           <o:p></o:p>
                        </span>
                     </p>
                  </td>
               </tr>
            </table>
            <!--EndFragment-->
         </body>
      </html>
    `;

    const actualHtml = convertMsWordHtml('', htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });
});
