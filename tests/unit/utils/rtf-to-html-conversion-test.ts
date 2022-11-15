import { module, test } from 'qunit';
import {convertGenericHtml, convertMsWordHtml} from '@lblod/ember-rdfa-editor/utils/ce/paste-handler-func';
import { oneLineTrim } from 'common-tags';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/html-input-parser';

module('Utils | CS | paste-handler', function () {
  test('sbx6 It should handle rtf -> html correctly', function (assert) {
    const rtfContent = String.raw`{\\\\rtf1\\\\ansi\\\\ansicpg1252\\\\cocoartf1265\\\\cocoasubrtf210\\n{\\\\fonttbl\\\\f0\\\\fswiss\\\\fcharset0 Helvetica;}\\n{\\\\colortbl;\\\\red255\\\\green255\\\\blue255;}\\n\\\\paperw11900\\\\paperh16840\\\\margl1440\\\\margr1440\\\\vieww10800\\\\viewh8400\\\\viewkind0\\n\\\\pard\\\\tx566\\\\tx1133\\\\tx1700\\\\tx2267\\\\tx2834\\\\tx3401\\\\tx3968\\\\tx4535\\\\tx5102\\\\tx5669\\\\tx6236\\\\tx6803\\\\pardirnatural\\n\\n\\\\f0\\\\fs24 \\\\cf0 Hello, World!\\\\\\n\\\\\\nThis is RTF. :-)`;
    const expectedHtml = '<span>Lorem Ipsum</span>';
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
        xmlns="http://www.w3.org/TR/REC-html40">

        <head>
        <meta http-equiv=Content-Type content="text/html; charset=utf-8">
        <meta name=ProgId content=Word.Document>
        <meta name=Generator content="Microsoft Word 15">
        <meta name=Originator content="Microsoft Word 15">
        </head>
        <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
        <!--StartFragment--><span style='font-size:14.0pt;font-family:"Calibri",sans-serif;
        mso-ascii-theme-font:minor-latin;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
        minor-latin;mso-hansi-theme-font:minor-latin;mso-bidi-font-family:"Times New Roman";
        mso-bidi-theme-font:minor-bidi;mso-ansi-language:#0C00;mso-fareast-language:
        EN-US;mso-bidi-language:AR-SA'>Lorem Ipsum</span><!--EndFragment-->
        </body>
    </html>
    `;

    const inputParser = new HTMLInputParser({});
    const actualHtml = convertMsWordHtml(rtfContent, htmlContent, inputParser);

    assert.strictEqual(expectedHtml, actualHtml);
  });

  test('sbx6 It should display clean HTML', function (assert) {
    const expectedHtml = '<span>Lorem Ipsum</span>';
    const inputParser = new HTMLInputParser({});
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
        xmlns="http://www.w3.org/TR/REC-html40">

        <head>
        <meta http-equiv=Content-Type content="text/html; charset=utf-8">
        <meta name=ProgId content=Word.Document>
        <meta name=Generator content="Microsoft Word 15">
        <meta name=Originator content="Microsoft Word 15">
        </head>
        <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
        <!--StartFragment--><span style='font-size:14.0pt;font-family:"Calibri",sans-serif;
        mso-ascii-theme-font:minor-latin;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
        minor-latin;mso-hansi-theme-font:minor-latin;mso-bidi-font-family:"Times New Roman";
        mso-bidi-theme-font:minor-bidi;mso-ansi-language:#0C00;mso-fareast-language:
        EN-US;mso-bidi-language:AR-SA'>Lorem Ipsum</span><!--EndFragment-->
        </body>
    </html>
    `;

    const actualHtml = convertGenericHtml(htmlContent, inputParser);
    assert.strictEqual(expectedHtml, actualHtml);
  });
});
