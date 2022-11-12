class FactoryUtils {
  public static create<T>(n: number, fn: () => T): T[] {
    return Array(n).fill(null).map(fn);
  }

  public static mapToValue(arr, val) {
    return arr.map((x) => x[val]);
  }
  public static compareByDate(a, b) {
    return -1 * (new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
export default FactoryUtils;
