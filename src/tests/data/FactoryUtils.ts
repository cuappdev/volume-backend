class FactoryUtils {
  public static create<T>(n: number, fn: () => T): T[] {
    return Array(n).fill(null).map(fn);
  }

  public static mapToValue(arr, val) {
    return arr.map((x) => x[val]);
  }
}
export default FactoryUtils;
