import { module, test } from 'qunit';
import { oneLineTrim } from 'common-tags';
import { convertMsWordHtml } from '@lblod/ember-rdfa-editor/utils/_private/ce/paste-handler-func';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';
import * as DOMPurify from 'dompurify';

module('Utils | CS | paste-handler | convertMsWordHtml', function () {
  test('It should handle rtf -> html correctly', function (assert) {
    const expectedHtml = oneLineTrim`<span style="font-size:14.0pt;font-family:&quot;Calibri&quot;,sans-serif; mso-ascii-theme-font:minor-latin;mso-fareast-font-family:Calibri;mso-fareast-theme-font: minor-latin;mso-hansi-theme-font:minor-latin;mso-bidi-font-family:&quot;Times New Roman&quot;; mso-bidi-theme-font:minor-bidi;mso-ansi-language:#0C00;mso-fareast-language: EN-US;mso-bidi-language:AR-SA">Lorem Ipsum</span>`;
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
    const actualHtml = convertMsWordHtml(htmlContent, inputParser);

    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should display formatted list as HTML', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
     <ul>
       <li>
        <span style=\"font-size:14.0pt; mso-ansi-language:EN-US\" lang=\"EN-US\">Feature</span>
        <span style=\"font-size:14.0pt\" lang=\"EN-US\"> </span>
        <span style=\"font-size:14.0pt;mso-ansi-language:EN-US\" lang=\"EN-US\">1</span>
      </li>
      <li>
        <span style=\"font-size:14.0pt; mso-ansi-language:EN-US\" lang=\"EN-US\">Feature</span>
        <span style=\"font-size:14.0pt\" lang=\"EN-US\"> </span>
        <span style=\"font-size:14.0pt;mso-ansi-language:EN-US\" lang=\"EN-US\">2</span>
      </li>
    </ul>`;
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should display nested list correctly as HTML', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
       <ol>
         <li>
           <span style=\"font-size:18.0pt;mso-ansi-language:EN-US\" lang=\"EN-US\">Test1</span>
           <ol>
             <li>
               <span style=\"font-size:18.0pt; mso-ansi-language:EN-US\" lang=\"EN-US\">Subtest1</span>
               <ol>
                 <li>
                   <span style=\"font-size:18.0pt;mso-ansi-language:EN-US\" lang=\"EN-US\">Subsubset1.1</span>
                   <ol>
                     <li>
                       <span style=\"font-size:18.0pt;mso-ansi-language:EN-US\" lang=\"EN-US\">Sub-sub-subet1.1</span>
                     </li>
                   </ol>
                 </li>
               </ol>
             </li>
           </ol>
         </li>
         <li>
           <span style=\"font-size:18.0pt;mso-ansi-language:EN-US\" lang=\"EN-US\">Test 2</span>
         </li>
       </ol>`;
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
   <head>
      <meta http-equiv=Content-Type content="text/html; charset=utf-8">
      <meta name=ProgId content=Word.Document>
      <meta name=Generator content="Microsoft Word 15">
      <meta name=Originator content="Microsoft Word 15">
      <link rel=File-List href="file:////Users/sbx6/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_filelist.xml">
      <!--[if gte mso 9]>
      <xml>
         <o:OfficeDocumentSettings>
            <o:AllowPNG/>
         </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <link rel=themeData href="file:////Users/sbx6/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_themedata.thmx">
      <link rel=colorSchemeMapping href="file:////Users/sbx6/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_colorschememapping.xml">
      <!--[if gte mso 9]>
      <xml>
         <w:WordDocument>
            <w:View>Normal</w:View>
            <w:Zoom>0</w:Zoom>
            <w:TrackMoves/>
            <w:TrackFormatting/>
            <w:PunctuationKerning/>
            <w:ValidateAgainstSchemas/>
            <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid>
            <w:IgnoreMixedContent>false</w:IgnoreMixedContent>
            <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText>
            <w:DoNotPromoteQF/>
            <w:LidThemeOther>en-AL</w:LidThemeOther>
            <w:LidThemeAsian>X-NONE</w:LidThemeAsian>
            <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript>
            <w:Compatibility>
               <w:BreakWrappedTables/>
               <w:SnapToGridInCell/>
               <w:WrapTextWithPunct/>
               <w:UseAsianBreakRules/>
               <w:DontGrowAutofit/>
               <w:SplitPgBreakAndParaMark/>
               <w:EnableOpenTypeKerning/>
               <w:DontFlipMirrorIndents/>
               <w:OverrideTableStyleHps/>
            </w:Compatibility>
            <m:mathPr>
               <m:mathFont m:val="Cambria Math"/>
               <m:brkBin m:val="before"/>
               <m:brkBinSub m:val="&#45;-"/>
               <m:smallFrac m:val="off"/>
               <m:dispDef/>
               <m:lMargin m:val="0"/>
               <m:rMargin m:val="0"/>
               <m:defJc m:val="centerGroup"/>
               <m:wrapIndent m:val="1440"/>
               <m:intLim m:val="subSup"/>
               <m:naryLim m:val="undOvr"/>
            </m:mathPr>
         </w:WordDocument>
      </xml>
      <![endif]--><!--[if gte mso 9]>
      <xml>
         <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="false" DefSemiHidden="false" DefQFormat="false" DefPriority="99" LatentStyleCount="376">
            <w:LsdException Locked="false" Priority="0" QFormat="true" Name="Normal"/>
            <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 1"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 2"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 3"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 4"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 5"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 6"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 7"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 8"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 9"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 7"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 8"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 9"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 1"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 2"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 3"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 4"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 5"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 6"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 7"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 8"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 9"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Normal Indent"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="footnote text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="annotation text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="header"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="footer"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index heading"/>
            <w:LsdException Locked="false" Priority="35" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="caption"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="table of figures"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="envelope address"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="envelope return"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="footnote reference"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="annotation reference"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="line number"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="page number"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="endnote reference"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="endnote text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="table of authorities"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="macro"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="toa heading"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 5"/>
            <w:LsdException Locked="false" Priority="10" QFormat="true" Name="Title"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Closing"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Signature"/>
            <w:LsdException Locked="false" Priority="1" SemiHidden="true" UnhideWhenUsed="true" Name="Default Paragraph Font"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text Indent"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Message Header"/>
            <w:LsdException Locked="false" Priority="11" QFormat="true" Name="Subtitle"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Salutation"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Date"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text First Indent"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text First Indent 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Note Heading"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text Indent 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text Indent 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Block Text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Hyperlink"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="FollowedHyperlink"/>
            <w:LsdException Locked="false" Priority="22" QFormat="true" Name="Strong"/>
            <w:LsdException Locked="false" Priority="20" QFormat="true" Name="Emphasis"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Document Map"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Plain Text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="E-mail Signature"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Top of Form"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Bottom of Form"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Normal (Web)"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Acronym"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Address"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Cite"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Code"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Definition"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Keyboard"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Preformatted"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Sample"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Typewriter"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Variable"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Normal Table"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="annotation subject"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="No List"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Outline List 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Outline List 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Outline List 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Simple 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Simple 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Simple 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Colorful 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Colorful 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Colorful 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 7"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 8"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 7"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 8"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table 3D effects 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table 3D effects 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table 3D effects 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Contemporary"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Elegant"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Professional"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Subtle 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Subtle 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Web 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Web 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Web 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Balloon Text"/>
            <w:LsdException Locked="false" Priority="39" Name="Table Grid"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Theme"/>
            <w:LsdException Locked="false" SemiHidden="true" Name="Placeholder Text"/>
            <w:LsdException Locked="false" Priority="1" QFormat="true" Name="No Spacing"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 1"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 1"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 1"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 1"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 1"/>
            <w:LsdException Locked="false" SemiHidden="true" Name="Revision"/>
            <w:LsdException Locked="false" Priority="34" QFormat="true" Name="List Paragraph"/>
            <w:LsdException Locked="false" Priority="29" QFormat="true" Name="Quote"/>
            <w:LsdException Locked="false" Priority="30" QFormat="true" Name="Intense Quote"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 1"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 1"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 1"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 1"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 1"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 1"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 2"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 2"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 2"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 2"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 2"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 2"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 2"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 2"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 2"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 2"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 2"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 3"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 3"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 3"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 3"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 3"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 3"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 3"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 3"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 3"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 3"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 3"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 4"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 4"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 4"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 4"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 4"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 4"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 4"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 4"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 4"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 4"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 4"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 5"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 5"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 5"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 5"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 5"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 5"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 5"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 5"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 5"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 5"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 5"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 6"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 6"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 6"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 6"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 6"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 6"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 6"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 6"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 6"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 6"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 6"/>
            <w:LsdException Locked="false" Priority="19" QFormat="true" Name="Subtle Emphasis"/>
            <w:LsdException Locked="false" Priority="21" QFormat="true" Name="Intense Emphasis"/>
            <w:LsdException Locked="false" Priority="31" QFormat="true" Name="Subtle Reference"/>
            <w:LsdException Locked="false" Priority="32" QFormat="true" Name="Intense Reference"/>
            <w:LsdException Locked="false" Priority="33" QFormat="true" Name="Book Title"/>
            <w:LsdException Locked="false" Priority="37" SemiHidden="true" UnhideWhenUsed="true" Name="Bibliography"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="TOC Heading"/>
            <w:LsdException Locked="false" Priority="41" Name="Plain Table 1"/>
            <w:LsdException Locked="false" Priority="42" Name="Plain Table 2"/>
            <w:LsdException Locked="false" Priority="43" Name="Plain Table 3"/>
            <w:LsdException Locked="false" Priority="44" Name="Plain Table 4"/>
            <w:LsdException Locked="false" Priority="45" Name="Plain Table 5"/>
            <w:LsdException Locked="false" Priority="40" Name="Grid Table Light"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 1"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 1"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 1"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 1"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 2"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 2"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 2"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 2"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 3"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 3"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 3"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 3"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 4"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 4"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 4"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 4"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 5"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 5"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 5"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 5"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 6"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 6"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 6"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 6"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 6"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 6"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 1"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 1"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 1"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 1"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 2"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 2"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 2"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 2"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 3"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 3"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 3"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 3"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 4"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 4"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 4"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 4"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 5"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 5"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 5"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 5"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 6"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 6"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 6"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 6"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 6"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Mention"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Smart Hyperlink"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Hashtag"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Unresolved Mention"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Smart Link"/>
         </w:LatentStyles>
      </xml>
      <![endif]-->
      <style>
         <!-- /* Font Definitions */ @font-face {font-family:"Cambria Math"; panose-1:2 4 5 3 5 4 6 3 2 4; mso-font-charset:0; mso-generic-font-family:roman; mso-font-pitch:variable; mso-font-signature:3 0 0 0 1 0;} @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-536859905 -1073732485 9 0 511 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin:0cm; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} @page WordSection1 {size:612.0pt 792.0pt; margin:72.0pt 72.0pt 72.0pt 72.0pt; mso-header-margin:36.0pt; mso-footer-margin:36.0pt; mso-paper-source:0;} div.WordSection1 {page:WordSection1;} /* List Definitions */ @list l0 {mso-list-id:1183395441; mso-list-type:hybrid; mso-list-template-ids:-1291562238 134807567 134807577 134807579 134807567 134807577 134807579 134807567 134807577 134807579;} @list l0:level1 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level2 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level3 {mso-level-number-format:roman-lower; mso-level-tab-stop:none; mso-level-number-position:right; text-indent:-9.0pt;} @list l0:level4 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level5 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level6 {mso-level-number-format:roman-lower; mso-level-tab-stop:none; mso-level-number-position:right; text-indent:-9.0pt;} @list l0:level7 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level8 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level9 {mso-level-number-format:roman-lower; mso-level-tab-stop:none; mso-level-number-position:right; text-indent:-9.0pt;} ol {margin-bottom:0cm;} ul {margin-bottom:0cm;} -->
      </style>
      <!--[if gte mso 10]>
      <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin:0cm; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} </style>
      <![endif]-->
   </head>
   <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
      <!--StartFragment-->
      <p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>Test1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>a.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:18.0pt; mso-ansi-language:EN-US'>Subtest1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:108.0pt;mso-add-space: auto;text-indent:-108.0pt;mso-text-indent-alt:-9.0pt;mso-list:l0 level3 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>i.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>Subsubset1.1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:144.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level4 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>Sub-sub-subet1.1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]><span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>Test 2</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <!--EndFragment-->
   </body>
</html>
    `;

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should display a complex nested list correctly as HTML', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`<ol>
    <li><span style="font-size:18.0pt;mso-ansi-language:EN-US" lang="EN-US">1</span>
        <ol>
            <li><span style="font-size:18.0pt; mso-ansi-language:EN-US" lang="EN-US">1.1</span></li>
            <li><span style="font-size:18.0pt; mso-ansi-language:EN-US" lang="EN-US">1.2</span>
                <ol>
                    <li><span style="font-size:18.0pt;mso-ansi-language:EN-US" lang="EN-US">1.2.1</span>
                        <ol>
                            <li><span style="font-size:18.0pt;mso-ansi-language:EN-US" lang="EN-US">1.2.1.1</span></li>
                            <li><span style="font-size:18.0pt;mso-ansi-language:EN-US" lang="EN-US">1.2.1.2</span></li>
                        </ol>
                    </li>
                </ol>
            </li>
            <li><span style="font-size:18.0pt; mso-ansi-language:EN-US" lang="EN-US">1.3</span></li>
        </ol>
    </li>
    <li><span style="font-size:18.0pt;mso-ansi-language:EN-US" lang="EN-US">2</span></li>
</ol>
    `;
    const htmlContent = oneLineTrim`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
   <head>
      <meta http-equiv=Content-Type content="text/html; charset=utf-8">
      <meta name=ProgId content=Word.Document>
      <meta name=Generator content="Microsoft Word 15">
      <meta name=Originator content="Microsoft Word 15">
      <link rel=File-List href="file:////Users/sbx6/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_filelist.xml">
      <!--[if gte mso 9]>
      <xml>
         <o:OfficeDocumentSettings>
            <o:AllowPNG/>
         </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <link rel=themeData href="file:////Users/sbx6/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_themedata.thmx">
      <link rel=colorSchemeMapping href="file:////Users/sbx6/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_colorschememapping.xml">
      <!--[if gte mso 9]>
      <xml>
         <w:WordDocument>
            <w:View>Normal</w:View>
            <w:Zoom>0</w:Zoom>
            <w:TrackMoves/>
            <w:TrackFormatting/>
            <w:PunctuationKerning/>
            <w:ValidateAgainstSchemas/>
            <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid>
            <w:IgnoreMixedContent>false</w:IgnoreMixedContent>
            <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText>
            <w:DoNotPromoteQF/>
            <w:LidThemeOther>en-AL</w:LidThemeOther>
            <w:LidThemeAsian>X-NONE</w:LidThemeAsian>
            <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript>
            <w:Compatibility>
               <w:BreakWrappedTables/>
               <w:SnapToGridInCell/>
               <w:WrapTextWithPunct/>
               <w:UseAsianBreakRules/>
               <w:DontGrowAutofit/>
               <w:SplitPgBreakAndParaMark/>
               <w:EnableOpenTypeKerning/>
               <w:DontFlipMirrorIndents/>
               <w:OverrideTableStyleHps/>
            </w:Compatibility>
            <m:mathPr>
               <m:mathFont m:val="Cambria Math"/>
               <m:brkBin m:val="before"/>
               <m:brkBinSub m:val="&#45;-"/>
               <m:smallFrac m:val="off"/>
               <m:dispDef/>
               <m:lMargin m:val="0"/>
               <m:rMargin m:val="0"/>
               <m:defJc m:val="centerGroup"/>
               <m:wrapIndent m:val="1440"/>
               <m:intLim m:val="subSup"/>
               <m:naryLim m:val="undOvr"/>
            </m:mathPr>
         </w:WordDocument>
      </xml>
      <![endif]--><!--[if gte mso 9]>
      <xml>
         <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="false" DefSemiHidden="false" DefQFormat="false" DefPriority="99" LatentStyleCount="376">
            <w:LsdException Locked="false" Priority="0" QFormat="true" Name="Normal"/>
            <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 1"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 2"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 3"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 4"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 5"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 6"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 7"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 8"/>
            <w:LsdException Locked="false" Priority="9" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="heading 9"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 7"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 8"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index 9"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 1"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 2"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 3"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 4"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 5"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 6"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 7"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 8"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" Name="toc 9"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Normal Indent"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="footnote text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="annotation text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="header"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="footer"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="index heading"/>
            <w:LsdException Locked="false" Priority="35" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="caption"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="table of figures"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="envelope address"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="envelope return"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="footnote reference"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="annotation reference"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="line number"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="page number"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="endnote reference"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="endnote text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="table of authorities"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="macro"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="toa heading"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Bullet 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Number 5"/>
            <w:LsdException Locked="false" Priority="10" QFormat="true" Name="Title"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Closing"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Signature"/>
            <w:LsdException Locked="false" Priority="1" SemiHidden="true" UnhideWhenUsed="true" Name="Default Paragraph Font"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text Indent"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="List Continue 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Message Header"/>
            <w:LsdException Locked="false" Priority="11" QFormat="true" Name="Subtitle"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Salutation"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Date"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text First Indent"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text First Indent 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Note Heading"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text Indent 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Body Text Indent 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Block Text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Hyperlink"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="FollowedHyperlink"/>
            <w:LsdException Locked="false" Priority="22" QFormat="true" Name="Strong"/>
            <w:LsdException Locked="false" Priority="20" QFormat="true" Name="Emphasis"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Document Map"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Plain Text"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="E-mail Signature"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Top of Form"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Bottom of Form"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Normal (Web)"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Acronym"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Address"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Cite"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Code"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Definition"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Keyboard"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Preformatted"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Sample"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Typewriter"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="HTML Variable"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Normal Table"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="annotation subject"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="No List"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Outline List 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Outline List 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Outline List 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Simple 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Simple 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Simple 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Classic 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Colorful 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Colorful 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Colorful 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Columns 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 7"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Grid 8"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 4"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 5"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 7"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table List 8"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table 3D effects 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table 3D effects 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table 3D effects 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Contemporary"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Elegant"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Professional"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Subtle 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Subtle 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Web 1"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Web 2"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Web 3"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Balloon Text"/>
            <w:LsdException Locked="false" Priority="39" Name="Table Grid"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Table Theme"/>
            <w:LsdException Locked="false" SemiHidden="true" Name="Placeholder Text"/>
            <w:LsdException Locked="false" Priority="1" QFormat="true" Name="No Spacing"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 1"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 1"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 1"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 1"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 1"/>
            <w:LsdException Locked="false" SemiHidden="true" Name="Revision"/>
            <w:LsdException Locked="false" Priority="34" QFormat="true" Name="List Paragraph"/>
            <w:LsdException Locked="false" Priority="29" QFormat="true" Name="Quote"/>
            <w:LsdException Locked="false" Priority="30" QFormat="true" Name="Intense Quote"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 1"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 1"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 1"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 1"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 1"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 1"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 2"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 2"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 2"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 2"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 2"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 2"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 2"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 2"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 2"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 2"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 2"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 3"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 3"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 3"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 3"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 3"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 3"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 3"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 3"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 3"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 3"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 3"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 4"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 4"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 4"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 4"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 4"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 4"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 4"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 4"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 4"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 4"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 4"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 5"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 5"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 5"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 5"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 5"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 5"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 5"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 5"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 5"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 5"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 5"/>
            <w:LsdException Locked="false" Priority="60" Name="Light Shading Accent 6"/>
            <w:LsdException Locked="false" Priority="61" Name="Light List Accent 6"/>
            <w:LsdException Locked="false" Priority="62" Name="Light Grid Accent 6"/>
            <w:LsdException Locked="false" Priority="63" Name="Medium Shading 1 Accent 6"/>
            <w:LsdException Locked="false" Priority="64" Name="Medium Shading 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="65" Name="Medium List 1 Accent 6"/>
            <w:LsdException Locked="false" Priority="66" Name="Medium List 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="67" Name="Medium Grid 1 Accent 6"/>
            <w:LsdException Locked="false" Priority="68" Name="Medium Grid 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="69" Name="Medium Grid 3 Accent 6"/>
            <w:LsdException Locked="false" Priority="70" Name="Dark List Accent 6"/>
            <w:LsdException Locked="false" Priority="71" Name="Colorful Shading Accent 6"/>
            <w:LsdException Locked="false" Priority="72" Name="Colorful List Accent 6"/>
            <w:LsdException Locked="false" Priority="73" Name="Colorful Grid Accent 6"/>
            <w:LsdException Locked="false" Priority="19" QFormat="true" Name="Subtle Emphasis"/>
            <w:LsdException Locked="false" Priority="21" QFormat="true" Name="Intense Emphasis"/>
            <w:LsdException Locked="false" Priority="31" QFormat="true" Name="Subtle Reference"/>
            <w:LsdException Locked="false" Priority="32" QFormat="true" Name="Intense Reference"/>
            <w:LsdException Locked="false" Priority="33" QFormat="true" Name="Book Title"/>
            <w:LsdException Locked="false" Priority="37" SemiHidden="true" UnhideWhenUsed="true" Name="Bibliography"/>
            <w:LsdException Locked="false" Priority="39" SemiHidden="true" UnhideWhenUsed="true" QFormat="true" Name="TOC Heading"/>
            <w:LsdException Locked="false" Priority="41" Name="Plain Table 1"/>
            <w:LsdException Locked="false" Priority="42" Name="Plain Table 2"/>
            <w:LsdException Locked="false" Priority="43" Name="Plain Table 3"/>
            <w:LsdException Locked="false" Priority="44" Name="Plain Table 4"/>
            <w:LsdException Locked="false" Priority="45" Name="Plain Table 5"/>
            <w:LsdException Locked="false" Priority="40" Name="Grid Table Light"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 1"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 1"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 1"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 1"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 2"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 2"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 2"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 2"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 3"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 3"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 3"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 3"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 4"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 4"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 4"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 4"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 5"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 5"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 5"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 5"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="46" Name="Grid Table 1 Light Accent 6"/>
            <w:LsdException Locked="false" Priority="47" Name="Grid Table 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="48" Name="Grid Table 3 Accent 6"/>
            <w:LsdException Locked="false" Priority="49" Name="Grid Table 4 Accent 6"/>
            <w:LsdException Locked="false" Priority="50" Name="Grid Table 5 Dark Accent 6"/>
            <w:LsdException Locked="false" Priority="51" Name="Grid Table 6 Colorful Accent 6"/>
            <w:LsdException Locked="false" Priority="52" Name="Grid Table 7 Colorful Accent 6"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 1"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 1"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 1"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 1"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 1"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 1"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 2"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 2"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 2"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 2"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 2"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 2"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 3"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 3"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 3"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 3"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 3"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 3"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 4"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 4"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 4"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 4"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 4"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 4"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 5"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 5"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 5"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 5"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 5"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 5"/>
            <w:LsdException Locked="false" Priority="46" Name="List Table 1 Light Accent 6"/>
            <w:LsdException Locked="false" Priority="47" Name="List Table 2 Accent 6"/>
            <w:LsdException Locked="false" Priority="48" Name="List Table 3 Accent 6"/>
            <w:LsdException Locked="false" Priority="49" Name="List Table 4 Accent 6"/>
            <w:LsdException Locked="false" Priority="50" Name="List Table 5 Dark Accent 6"/>
            <w:LsdException Locked="false" Priority="51" Name="List Table 6 Colorful Accent 6"/>
            <w:LsdException Locked="false" Priority="52" Name="List Table 7 Colorful Accent 6"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Mention"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Smart Hyperlink"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Hashtag"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Unresolved Mention"/>
            <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true" Name="Smart Link"/>
         </w:LatentStyles>
      </xml>
      <![endif]-->
      <style>
         <!-- /* Font Definitions */ @font-face {font-family:"Cambria Math"; panose-1:2 4 5 3 5 4 6 3 2 4; mso-font-charset:0; mso-generic-font-family:roman; mso-font-pitch:variable; mso-font-signature:3 0 0 0 1 0;} @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-536859905 -1073732485 9 0 511 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin:0cm; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; mso-add-space:auto; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} @page WordSection1 {size:612.0pt 792.0pt; margin:72.0pt 72.0pt 72.0pt 72.0pt; mso-header-margin:36.0pt; mso-footer-margin:36.0pt; mso-paper-source:0;} div.WordSection1 {page:WordSection1;} /* List Definitions */ @list l0 {mso-list-id:1183395441; mso-list-type:hybrid; mso-list-template-ids:-1291562238 134807567 134807577 134807579 134807567 134807577 134807579 134807567 134807577 134807579;} @list l0:level1 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level2 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level3 {mso-level-number-format:roman-lower; mso-level-tab-stop:none; mso-level-number-position:right; text-indent:-9.0pt;} @list l0:level4 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level5 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level6 {mso-level-number-format:roman-lower; mso-level-tab-stop:none; mso-level-number-position:right; text-indent:-9.0pt;} @list l0:level7 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level8 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt;} @list l0:level9 {mso-level-number-format:roman-lower; mso-level-tab-stop:none; mso-level-number-position:right; text-indent:-9.0pt;} ol {margin-bottom:0cm;} ul {margin-bottom:0cm;} -->
      </style>
      <!--[if gte mso 10]>
      <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin:0cm; mso-pagination:widow-orphan; font-size:12.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} </style>
      <![endif]-->
   </head>
   <body lang=en-AL style='tab-interval:36.0pt;word-wrap:break-word'>
      <!--StartFragment-->
      <p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>a.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt; mso-ansi-language:EN-US'>1.1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>a.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt; mso-ansi-language:EN-US'>1.2</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:108.0pt;mso-add-space: auto;text-indent:-108.0pt;mso-text-indent-alt:-9.0pt;mso-list:l0 level3 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>i.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>1.2.1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:144.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level4 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>1.2.1.1</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:144.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level4 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>1.2.1.2</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space: auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>a.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt; mso-ansi-language:EN-US'>1.3</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>
         <![if !supportLists]><span style='font-size:18.0pt;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp; </span></span></span><![endif]>
         <span lang=EN-US style='font-size:18.0pt;mso-ansi-language:EN-US'>2</span>
         <span style='font-size:18.0pt'>
            <o:p></o:p>
         </span>
      </p>
      <!--EndFragment-->
   </body>
</html>
    `;

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });
  test('It should display formatted table as HTML', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
<table><tbody><tr><td><p><span>Column 1</span></p></td><td><p><span>Column 2</span></p></td><td><p><span>Column 3</span></p></td><td><p><span>Column4</span></p></td></tr><tr><td><p><span>Test1</span></p></td><td><p><span>Test2</span></p></td><td><p><span>Test3</span></p></td><td><p><span>Test4</span></p></td></tr><tr><td><p><span>Test5</span></p></td><td><p><span>Test6</span></p></td><td><p><span>Test7</span></p></td><td><p><span>Test8</span></p></td></tr><tr><td><p><span>Test9</span></p></td><td><p><span>Test10</span></p></td><td><p><span>Test11</span></p></td><td><p><span>Test12</span></p></td></tr></tbody></table>
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(
      // strip attrs to make test less flaky
      DOMPurify.sanitize(actualHtml, { ALLOWED_ATTR: [] }),
      expectedHtml
    );
  });

  test('It should display bold text', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
      <p class=\"MsoNormal\"><b><span style=\"font-size:14.0pt;mso-ansi-language: EN-US\" lang=\"EN-US\">Lorem Ipsum Bold</span></b></p>
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should display italic text', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
      <p class=\"MsoNormal\"><i><span style=\"font-size:14.0pt;mso-ansi-language: EN-US\" lang=\"EN-US\">Lorem Ipsum Bold</span></i></p>
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should display underlined text', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
      <p class=\"MsoNormal\"><u><span style=\"font-size:14.0pt;mso-ansi-language: EN-US\" lang=\"EN-US\">Lorem Ipsum Bold</span></u></p>
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should display formatted list in a table', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
<table><tbody><tr><td><p><span>Column 1</span></p></td><td><p><span>Column 2</span></p></td><td><p><span>Column 3</span></p></td><td><p><span>Column4</span></p></td></tr><tr><td><ul><li><span>List 1</span></li><li><span>List 2</span></li></ul></td><td><p><span>Test2</span></p></td><td><p><span>Test3</span></p></td><td><p><span>Test4</span></p></td></tr><tr><td><p><span>Test5</span></p></td><td><p><span>Test6</span></p></td><td><ul><li><span>List 3</span></li><li><span>List 4</span></li></ul></td><td><p><span>Test8</span></p></td></tr></tbody></table>
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(
      DOMPurify.sanitize(actualHtml, { ALLOWED_ATTR: [] }),
      expectedHtml
    );
  });

  test('It should display table in a list', function (assert) {
    const inputParser = new HTMLInputParser({});
    const expectedHtml = oneLineTrim`
<ul><li><span>List table 1</span></li></ul><table><tbody><tr><td><p><span>Table column 1</span></p></td><td><p><span>Table column 2</span></p></td></tr><tr><td><p><span>Data 1</span></p></td><td><p><span>Data2</span></p></td></tr></tbody></table><ul><li><span>List table 2</span></li></ul><table><tbody><tr><td><p><span>Table column 1</span></p></td><td><p><span>Table column 2</span></p></td></tr><tr><td><p><span>Data 1</span></p></td><td><p><span>Data 2</span></p></td></tr></tbody></table>
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

    const actualHtml = convertMsWordHtml(htmlContent, inputParser);
    assert.strictEqual(
      DOMPurify.sanitize(actualHtml, { ALLOWED_ATTR: [] }),
      expectedHtml
    );
  });
});
