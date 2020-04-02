/**
 * Maps location of substring back within reference location
 * NOTE: [EXPERIMENTAL] this function may move to another location.
 * @param {[int,int]} [start, end] Location withing string
 * @param {[int,int]} [start, end] reference location
 *
 * @return {[int,int]} [start, end] absolute location
 */
export default function normalizeLocation(location, reference) {
  return [location[0] + reference[0], location[1] + reference[0]];
}
