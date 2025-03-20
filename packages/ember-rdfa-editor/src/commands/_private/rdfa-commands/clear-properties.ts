// Shelved for now
// import {
//   getNodeByRdfaId,
//   getNodesByResource,
// } from '@lblod/ember-rdfa-editor/plugins/rdfa-info.ts';
// import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types.ts';
// import {
//   getBacklinks,
//   getProperties,
//   getResource,
// } from '@lblod/ember-rdfa-editor/utils/rdfa-utils.ts';
// import { Command } from 'prosemirror-state';

// type ClearPropertiesArgs = {
//   position: number;
// };

// export function clearProperties({ position }: ClearPropertiesArgs): Command {
//   return function (state, dispatch) {
//     const node = state.doc.nodeAt(position);
//     if (!node) {
//       return false;
//     }
//     const properties = getProperties(node);
//     if (!dispatch || !properties) {
//       return true;
//     }

//     //When clearing the properties of a node, we also need to clear the inverse backlinks
//     const tr = state.tr;
//     tr.setNodeAttribute(position, 'properties', []);
//     properties.forEach((prop) => {
//       if (prop.type === 'external') {
//         const { object } = prop;
//         let targets: ResolvedPNode[] | undefined;
//         /**
//          * We need two make two cases here
//          * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
//          * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
//          */
//         if (object.type === 'literal') {
//           const target = getNodeByRdfaId(state, object.rdfaId);
//           if (target) {
//             targets = [target];
//           }
//         } else {
//           targets = getNodesByResource(state, object.resource);
//         }
//         targets?.forEach((target) => {
//           const backlinks = getBacklinks(target.value);
//           if (backlinks) {
//             const filteredBacklinks = backlinks.filter((backlink) => {
//               return !(
//                 backlink.predicate === prop.predicate &&
//                 backlink.subject === getResource(node)
//               );
//             });
//             tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
//           }
//         });
//       }
//     });
//     dispatch(tr);
//     return true;
//   };
// }
