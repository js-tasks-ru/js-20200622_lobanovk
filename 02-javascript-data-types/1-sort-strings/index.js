/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrSort = [...arr].sort((word1, word2) => word1.localeCompare(word2, 'kf', {usage: 'sort', caseFirst : "upper"}));

  return param === 'asc' ? arrSort : arrSort.reverse();
}
