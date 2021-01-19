export default function <T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}
