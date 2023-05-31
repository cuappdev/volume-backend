class FactoryUtils {
  public static create<T>(n: number, fn: () => T): T[] {
    return Array(n).fill(null).map(fn);
  }

  /**
   * Takes in an list of objects and returns a list of elements mapped
   * to a given key value for each object
   *
   * @param lst The list of objects
   * @param key The key to get values from
   * @returns An array of values that were mapped to key
   */
  public static mapToValue(lst, key) {
    return lst.map((x) => x[key]);
  }

  /**
   * Compares the time between two dates by most recent first
   *
   * @param a The first date to be compared
   * @param b The second date to be compared
   * @returns 1 if b is more recent than a, -1 if a is more recent than b, 0 if a and b are at the same time
   */
  public static compareByDate(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }

  /**
   * Compares the time between two end dates by most recent first
   *
   * @param a The first date to be compared
   * @param b The second date to be compared
   * @returns 1 if b is more recent than a, -1 if a is more recent than b, 0 if a and b are at the same time
   */
  public static compareByEndDate(a, b) {
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  }

  /**
   * Compares the time between two start dates by most recent first
   *
   * @param a The first date to be compared
   * @param b The second date to be compared
   * @returns 1 if b is more recent than a, -1 if a is more recent than b, 0 if a and b are at the same time
   */
  public static compareByStartDate(a, b) {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  }
}
export default FactoryUtils;
