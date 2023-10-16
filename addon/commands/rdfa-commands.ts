import { Command, NodeSelection } from 'prosemirror-state';
import {
  findNodeByRdfaId,
  getBacklinks,
  getProperties,
  getRdfaId,
} from '../utils/rdfa-utils';

type ClearPropertiesArgs = {
  position: number;
};

export function clearProperties({ position }: ClearPropertiesArgs): Command {
  return function (state, dispatch) {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const properties = getProperties(node);
    if (properties && dispatch) {
      //When clearing the properties of a node, we also need to clear the inverse backlinks
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', []);
      properties.forEach((prop) => {
        if (prop.type === 'node') {
          const targetNode = findNodeByRdfaId(tr.doc, prop.nodeId);
          if (targetNode) {
            const targetNodeBacklinks = getBacklinks(targetNode.value);
            if (targetNodeBacklinks) {
              const filteredBacklinks = targetNodeBacklinks.filter(
                (backlink) => {
                  return !(
                    backlink.predicate === prop.predicate &&
                    backlink.subjectId === getRdfaId(node)
                  );
                },
              );
              tr.setNodeAttribute(
                targetNode.pos,
                'backlinks',
                filteredBacklinks,
              );
            }
          }
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

type ClearBacklinksArgs = {
  position: number;
};

export function clearBacklinks({ position }: ClearBacklinksArgs): Command {
  return function (state, dispatch) {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const backlinks = getBacklinks(node);
    if (backlinks && dispatch) {
      //When clearing the backlinks of a node, we also need to clear the inverse properties
      const tr = state.tr;
      tr.setNodeAttribute(position, 'backlinks', []);
      backlinks.forEach((backlink) => {
        const subjectNode = findNodeByRdfaId(tr.doc, backlink.subjectId);
        if (subjectNode) {
          const subjectNodeProperties = getProperties(subjectNode.value);
          if (subjectNodeProperties) {
            const filteredProperties = subjectNodeProperties.filter((prop) => {
              return !(
                backlink.predicate === prop.predicate &&
                backlink.subjectId === getRdfaId(subjectNode.value)
              );
            });
            tr.setNodeAttribute(
              subjectNode.pos,
              'properties',
              filteredProperties,
            );
          }
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

type RemovePropertyArgs = {
  position: number; // The position of the node from which to remove the property
  index: number; // The index of the property to be removed in the properties-array of the node
};

export function removeProperty({
  position,
  index,
}: RemovePropertyArgs): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const properties = getProperties(node);
    const propertyToRemove = properties?.[index];
    if (!propertyToRemove) {
      return false;
    }
    if (dispatch) {
      const updatedProperties = properties.slice();
      updatedProperties.splice(index, 1);
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', updatedProperties);
      if (propertyToRemove.type === 'node') {
        //Delete the inverse backlink
        const targetNode = findNodeByRdfaId(tr.doc, propertyToRemove.nodeId);
        if (targetNode) {
          const targetNodeBacklinks = getBacklinks(targetNode.value);
          if (targetNodeBacklinks) {
            const filteredBacklinks = targetNodeBacklinks.filter((backlink) => {
              return !(
                backlink.predicate === propertyToRemove.predicate &&
                backlink.subjectId === getRdfaId(node)
              );
            });
            tr.setNodeAttribute(targetNode.pos, 'backlinks', filteredBacklinks);
          }
        }
      }
      dispatch(tr);
    }
    return true;
  };
}

type RemoveBacklinkArgs = {
  position: number; // The position of the node from which to remove the backlink
  index: number; // The index of the property to be removed in the backlinks-array of the node
};

export function removeBacklink({
  position,
  index,
}: RemoveBacklinkArgs): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const backlinks = getBacklinks(node);
    const backlinkToRemove = backlinks?.[index];
    if (!backlinkToRemove) {
      return false;
    }
    console.log(backlinkToRemove);
    if (dispatch) {
      const updatedBacklinks = backlinks.slice();
      updatedBacklinks.splice(index, 1);
      const tr = state.tr;
      tr.setNodeAttribute(position, 'backlinks', updatedBacklinks);
      //Delete the inverse property
      const subjectNode = findNodeByRdfaId(tr.doc, backlinkToRemove.subjectId);
      if (subjectNode) {
        const subjectNodeProperties = getProperties(subjectNode.value);
        if (subjectNodeProperties) {
          const filteredProperties = subjectNodeProperties.filter((prop) => {
            return !(
              backlinkToRemove.predicate === prop.predicate &&
              backlinkToRemove.subjectId === getRdfaId(subjectNode.value)
            );
          });
          tr.setNodeAttribute(
            subjectNode.pos,
            'properties',
            filteredProperties,
          );
        }
      }
      dispatch(tr);
    }
    return true;
  };
}

type SelectNodeByRdfaIdArgs = {
  rdfaId: string;
};

export function selectNodeByRdfaId({
  rdfaId,
}: SelectNodeByRdfaIdArgs): Command {
  return (state, dispatch) => {
    const resolvedNode = findNodeByRdfaId(state.doc, rdfaId);
    if (!resolvedNode) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      tr.setSelection(
        new NodeSelection(tr.doc.resolve(resolvedNode.pos)),
      ).scrollIntoView();
      dispatch(tr);
    }
    return true;
  };
}
