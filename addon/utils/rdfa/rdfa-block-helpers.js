/**
 * Put blocks in the right order according to their start and end
 *
 * @method reorderBlocks
 * @param blocks
 * @return Array the ordered blocks
 */
function reorderBlocks(blocks) {
  //if (blocks.length == 1) return blocks;

  return blocks.sort((a, b) => {
    if (a.start > b.start) {
      // a starts after b
      return 1;
    } else if (a.start == b.start) {
      // a and b start at the same place
      return a.end - b.end;
    } else {
      // a starts before b
      return -1;
    }
  });
}

/**
 * Get the extended regions from an array of ordered blocks by merging neighbouring regions,
 * overlapping regions and regions included in other regions.
 *
 * @method getExtendedRegions
 * @param unprocessedOrderedRegions The ordered regions that need to be compared
 * @return [Array] The extended regions
 */
function getExtendedRegions(unprocessedOrderedRegions, mergedRegions = []) {
  // Breaking condition: we processed all the regions
  if (unprocessedOrderedRegions.length == 0) {
    return mergedRegions;
  }

  // Initialization
  if (mergedRegions.length == 0) {
    return getExtendedRegions(unprocessedOrderedRegions.slice(1), [
      unprocessedOrderedRegions[0],
    ]);
  }

  const currentRegion = unprocessedOrderedRegions[0];
  let newMergedRegions = [];
  let hasBeenMerged = false;

  for (let mergedRegion of mergedRegions) {
    // As the regions are ordered, the current region we're testing will always be at the right of the mergedRegions
    if (
      isLeftNeighbourOf(mergedRegion, currentRegion) ||
      isPartiallyIncludedLeft(mergedRegion, currentRegion)
    ) {
      // Regions are neighbourgs or overlapping
      newMergedRegions.push([mergedRegion[0], currentRegion[1]]);
      hasBeenMerged = true;
    } else if (isFullyIncluded(currentRegion, mergedRegion)) {
      // The current region is fully included in an already merged region
      newMergedRegions.push([mergedRegion[0], mergedRegion[1]]);
      hasBeenMerged = true;
    } else {
      // The merged region is separated from the current region, we need to keep it as it is
      newMergedRegions.push(mergedRegion);
    }
  }

  // If the current region is not touching any other existing merged regions, it's a new separated region
  if (!hasBeenMerged) {
    newMergedRegions.push([currentRegion[0], currentRegion[1]]);
  }

  return getExtendedRegions(
    unprocessedOrderedRegions.slice(1),
    newMergedRegions
  );
}

/*-----------------------------------------------------------------------*/
/*                                Helpers                                */
/*-----------------------------------------------------------------------*/

/**
 * Checks if a is the left neighbour of b
 * Ex: a=[1,4] and b=[4,6] is true
 */
function isLeftNeighbourOf(a, b) {
  return a[1] == b[0];
}

/**
 * Checks if a is partially included (overlapping) in b on the left side
 * Ex: a=[1,5] and b=[4,6] is true
 */
function isPartiallyIncludedLeft(a, b) {
  return a[1] >= b[0] && a[0] <= b[0] && a[1] < b[1];
}

/**
 * Checks if a is fully included in b on the left side
 * Ex: a=[4,5] and b=[3,6] is true
 */
function isFullyIncluded(a, b) {
  return a[0] >= b[0] && a[1] <= b[1];
}

export { reorderBlocks, getExtendedRegions };
