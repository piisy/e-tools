import { distinct, filter, from, map, skip, take, tap } from 'rxjs'
import { describe, expect, it } from 'vitest'

/**
 * RxJS 常用操作符测试
 * 主要测试:
 * 1. 转换操作符 (map)
 * 2. 过滤操作符 (filter, take, skip)
 * 3. 工具操作符 (tap)
 */
describe('rxJS Operators', () => {
  it('转换操作符 map', () => {
    const values: number[] = []

    from([1, 2, 3]).pipe(
      map(x => x * 2), // 将每个值翻倍
    ).subscribe(value => values.push(value))

    expect(values).toEqual([2, 4, 6])
  })

  it('过滤操作符 filter', () => {
    const values: number[] = []

    from([1, 2, 3, 4, 5]).pipe(
      filter(x => x % 2 === 0), // 只保留偶数
    ).subscribe(value => values.push(value))

    expect(values).toEqual([2, 4])
  })

  it('工具操作符 tap', () => {
    const sideEffects: number[] = []
    const values: number[] = []

    from([1, 2, 3]).pipe(
      tap(x => sideEffects.push(x)), // 副作用，不影响流中的值
      map(x => x * 2),
    ).subscribe(value => values.push(value))

    expect(sideEffects).toEqual([1, 2, 3]) // tap 接收原始值
    expect(values).toEqual([2, 4, 6]) // 最终结果不受 tap 影响
  })

  it('take 和 skip 操作符', () => {
    const values: number[] = []

    from([1, 2, 3, 4, 5]).pipe(
      skip(2), // 跳过前两个值
      take(2), // 然后只取两个值
    ).subscribe(value => values.push(value))

    expect(values).toEqual([3, 4])
  })

  it('distinct 操作符', () => {
    const values: number[] = []

    from([1, 1, 2, 2, 3, 3]).pipe(
      distinct(), // 去重
    ).subscribe(value => values.push(value))

    expect(values).toEqual([1, 2, 3])
  })
})
