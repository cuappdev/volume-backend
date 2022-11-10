class FactoryUtils {
  public static create<T>(n: number, fn: () => T): T[] {
    return Array(n).fill(null).map(fn);
  }
}
export default FactoryUtils;
