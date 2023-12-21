import { oneLineTrim } from "common-tags";

/**
 * test cases imported from https://www.w3.org/2006/07/SWD/RDFa/testsuite/
 */
const TEST_CASES = {
  //   '000002': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc11="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <body>
  //   This photo was taken by <span class="author" about="photo1.jpg" property="dc11:creator">Mark Birbeck</span>.
  // </body>
  // </html>
  // `,
  //   '000003': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <head>
  // </head>
  // <body>
  // <div class="container">
  //   <div about="photo1.jpg">
  //       This photo was taken by <meta property="dc:creator">Mark Birbeck</meta>.
  //   </div>
  // </div>
  // </body>
  // </html>`,
  //   '000004': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <head>
  // </head>
  // <body>
  //   <div about="photo1.jpg">
  //     <span class="attribution-line">
  //       This photo was taken by
  //       <meta property="dc:creator">Mark Birbeck</meta>
  //     </span>.
  //   </div>
  // </body>
  // </html>
  // `,
  //   '000005': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <head>
  // </head>
  // <body>
  // <span xml:base="http://internet-apps.blogspot.com/">
  //   <link about="" rel="dc:creator" href="http://www.blogger.com/profile/1109404" />
  //   <meta property="dc:title" content="Internet Applications" />
  // </span>
  // </body>
  // </html>
  // `,
  //   '000006': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <head>
  // </head>
  // <body>
  // This document is licensed under a
  // <a xmlns:cclicenses="http://creativecommons.org/licenses/"
  //  rel="cc:license"
  //  href="[cclicenses:by/nc-nd/2.5/]">Creative Commons License</a>.
  // </body>
  // </html>
  // `,
  //   '000007': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <head>
  // </head>
  // <body>
  // This photo was taken by
  // <a about="photo1.jpg" rel="dc:creator" rev="foaf:img"
  //    href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
  // </body>
  // </html>
  // `,
  //   '000008': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  // <head>
  // </head>
  // <body>
  // This photo was taken by
  // <a about="photo1.jpg" property="dc:title"
  //    content="Portrait of Mark" rel="dc:creator"
  //       rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
  // </body>
  // </html>
  // `,
  //   '000010': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //   This document is licensed under a
  //   <a about="" rel="cc:license"
  //      href="http://creativecommons.org/licenses/by-nc-nd/2.5/">
  //        Creative Commons
  //   </a>.
  //   </body>
  // </html>
  // `,
  //   '000011': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //     <link about="http://example.org/Person1"
  //           rev="foaf:knows" href="http://example.org/Person2" />

  //   </head>
  //   <body>
  //   </body>
  // </html>
  // `,
  //   '000012': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //     <link about="http://example.org/Person1"
  //           rel="foaf:knows" rev="foaf:knows" href="http://example.org/Person2" />
  //   </head>
  //   <body>
  //   </body>
  // </html>
  // `,
  //   '000013': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //   	<div about="">
  //       Author: <span property="dc:creator">Albert Einstein</span>
  //       <h2 property="dc:title">
  //         E = mc<sup>2</sup>: The Most Urgent Problem of Our Time
  //       </h2>
  // 	</div>
  //   </body>
  // </html>
  // `,
  //   '000014': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head about="">
  //   <meta about="http://example.org/node"
  //         property="ex:property" xml:lang="fr" content="chat" />
  //   </head>
  //   <body>
  //   </body>
  // </html>
  // `,
  //   '000015': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head about="" xml:lang="fr">
  //   <title xml:lang="en">Example Title</title>
  //   <meta about="http://example.org/node"
  //         property="ex:property" content="chat" />
  //   </head>
  //   <body>
  //   </body>
  // </html>
  // `,
  //   '000016': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //   <span about="http://example.org/foo"
  //         property="ex:bar" content="10" datatype="xsd:integer">ten</span>
  //   </body>
  // </html>
  // `,
  //   '000017': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   	<link rel="dc:source" href="urn:isbn:0140449132" />
  //     <meta property="dc:creator" content="Fyodor Dostoevsky" />
  //   </head>
  //   <body>
  //   </body>
  // </html>
  // `,
  //   '000019': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //     <link about="[_:a]" rel="dc:source" href="urn:isbn:0140449132" />
  //     <meta about="[_:a]" property="dc:creator" content="Fyodor Dostoevsky" />
  //   </head>
  //   <body>
  //     <blockquote about="[_:a]">
  //     <p>
  //       Rodion Romanovitch! My dear friend! If you go on in this way
  //       you will go mad, I am positive! Drink, pray, if only a few drops!
  //     </p>
  //     </blockquote>
  //   </body>
  // </html>
  // `,
  //   '000020': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //     <link about="[_:a]" rel="foaf:mbox"
  //       href="mailto:daniel.brickley@bristol.ac.uk" />
  //     <link about="[_:b]" rel="foaf:mbox"
  //       href="mailto:libby.miller@bristol.ac.uk" />
  //     <link about="[_:a]" rel="foaf:knows"
  //       href="[_:b]" />
  //   </head>
  //   <body>
  //   </body>
  // </html>
  // `,
  //   '000101': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  // 	  This photo was taken by
  // 	  <a about="photo1.jpg" rel="dc:creator"
  // 		 href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
  //   </body>
  // </html>

  // `,
  //   '000102': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <div about="mailto:daniel.brickley@bristol.ac.uk"
  //       rel="foaf:knows" href="mailto:libby.miller@bristol.ac.uk"></div>
  //   </body>
  // </html>

  // `,
  //   '000103': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <div about="photo1.jpg">
  //       <span class="attribution-line">this photo was taken by
  //         <span property="dc:creator">Mark Birbeck</span>
  //       </span>
  //     </div>
  //   </body>
  // </html>

  // `,
  //   '000104': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <div>
  //       <span class="attribution-line">this photo was taken by
  //         <span property="dc:creator">Mark Birbeck</span>
  //       </span>
  //     </div>
  //   </body>
  // </html>

  // `,
  //   '000105': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <div id="photo1">
  //         This photo was taken by <meta property="dc:creator">Mark Birbeck</meta>.
  //     </div>
  //   </body>
  // </html>

  // `,
  //   '000106': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <div id="photo1">
  //       <span class="attribution-line">this photo was taken by
  //         <span property="dc:creator">Mark Birbeck</span>
  //       </span>
  //     </div>
  //   </body>
  // </html>

  // `,
  //   '000107': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <div about="photo1.jpg">
  //       <div id="photo1">
  //         this photo was taken by <span property="dc:creator">Mark Birbeck</span>
  //       </div>
  //     </div>
  //   </body>
  // </html>

  // `,
  //   '000108': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     This paper was written by
  //     <div rel="dc:creator" id="me">
  //       <span property="foaf:name">Ben Adida</span>,
  //       <a rel="foaf:mbox" href="mailto:ben@adida.net">ben@adida.net</a>.
  //     </div>
  //   </body>
  // </html>

  // `,
  //   '000109': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  // 	<span about="http://internet-apps.blogspot.com/"
  // 	      property="dc:creator" content="Mark Birbeck"></span>
  //   </body>
  // </html>

  // `,
  //   '000110': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <span about="http://internet-apps.blogspot.com/"
  //        property="dc:creator" content="Mark Birbeck">Mark B.</span>
  //   </body>
  // </html>

  // `,
  //   '000112': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <span about="http://example.org/node"
  // 	  property="ex:property" xml:lang="fr" datatype="plainliteral">chat</span>
  //   </body>
  // </html>

  // `,
  //   '000113': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  // 	"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
  // <html xmlns="http://www.w3.org/1999/xhtml"
  //   xmlns:cc="http://web.resource.org/cc/"
  //   xmlns:dc="http://purl.org/dc/elements/1.1/"
  //   xmlns:ex="http://example.org/"
  //   xmlns:foaf="http://xmlns.com/foaf/0.1/"
  //   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  //   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  //   xmlns:svg="http://www.w3.org/2000/svg"
  //   xmlns:xh11="http://www.w3.org/1999/xhtml"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
  //   <head>
  //   </head>
  //   <body>
  //     <span about="http://example.org/foo"
  // 	      property="dc:creator" datatype="xsd:string"><b>M</b>ark <b>B</b>irbeck</span>.
  //   </body>
  // </html>

  // `,
  x0001: `<div lang="nl-BE" about="http://test.com/1" property="http://test.com/content">test</div>`,
  x0002: `
  <div lang="nl-BE" resource="http://test.com/1" property="http://test.com/content">test</div>
`,
  x0003: `
  <div lang="nl-BE" resource="http://test.com/1" ><span property="ext:foo">test</span></div>
`,
  x0004: `
  <div lang="nl-BE" resource="http://test.com/1" typeof="http://test.com/Type" ><span property="ext:foo">test</span></div>
`,
  x0005: `
  <div lang="nl-BE" resource="http://test.com/1" typeof="ext:Type" ><span property="ext:foo">test</span></div>
`,
  // this one seems correct according to rdfa.info/play, but our the parser lib we use
  // might have a bug
  // https://github.com/rubensworks/rdfa-streaming-parser.js/issues/58
  x0006_parser_bug: oneLineTrim`
<div lang="nl-BE"
     about="http://test.com/1"
     property="http://test.com/content">
  <div lang="nl-BE"
       about="http://test.com/1"
       property="http://test.com/content">
      other
  </div>
  <div lang="nl-BE"
       property="http://test.com/content">
      other2
  </div>
  test
</div>`,
};

export default TEST_CASES;
