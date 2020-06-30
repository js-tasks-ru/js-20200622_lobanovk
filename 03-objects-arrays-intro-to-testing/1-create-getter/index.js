/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arr = path.split('.');
  return (obj) => {
    if (Object.keys(obj).length === 0) return undefined;
    let result = {...obj}
    arr.forEach(item => result = result[item] ? result[item] : undefined);
    return result;
  }
}