/** 날짜 기반 아이템을 월별로 그룹핑 */
export function groupByMonth<T extends { date: Date }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = `${item.date.getFullYear()}-${item.date.getMonth()}`
    const list = groups.get(key)
    if (list) {
      list.push(item)
    } else {
      groups.set(key, [item])
    }
  }
  return groups
}
