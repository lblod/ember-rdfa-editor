// Shelved for now
// import { getNodesByResource } from '#root/plugins/rdfa-info';
// import {
//   getBacklinks,
//   getProperties,
//   getResource,
// } from '#root/utils/rdfa-utils';
// import { Command } from 'prosemirror-state';

// type ClearBacklinksArgs = {
//   position: number;
// };

// export function clearBacklinks({ position }: ClearBacklinksArgs): Command {
//   return function (state, dispatch) {
//     const node = state.doc.nodeAt(position);
//     if (!node) {
//       return false;
//     }
//     const backlinks = getBacklinks(node);
//     if (!dispatch || !backlinks) {
//       return true;
//     }

//     // When clearing the backlinks of a node, we also need to clear the inverse properties
//     const tr = state.tr;
//     tr.setNodeAttribute(position, 'backlinks', []);
//     backlinks.forEach((backlink) => {
//       // Update the properties of each inverse subject node
//       const subjects = getNodesByResource(state, backlink.subject);
//       subjects?.forEach((subject) => {
//         const properties = getProperties(subject.value);
//         if (properties) {
//           const filteredProperties = properties.filter((prop) => {
//             return !(
//               backlink.predicate === prop.predicate &&
//               backlink.subject === getResource(subject.value)
//             );
//           });
//           tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
//         }
//       });
//     });
//     dispatch(tr);
//     return true;
//   };
// }
