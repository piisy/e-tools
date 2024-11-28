import {
  count,
  defer,
  EMPTY,
  every,
  find,
  findIndex,
  from,
  generate,
  interval,
  isEmpty,
  max,
  min,
  Observable,
  of,
  range,
  take,
  timeInterval,
  timeout,
  timeoutWith,
  timestamp,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

/**
 * RxJS 剩余操作符测试
 * 主要测试一些不常见但有用的操作符
 */
describe('remaining RxJS Operators', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('创建类操作符', () => {
    it('defer - 延迟创建 Observable', () => {
      let count = 0

      // defer 会为每个订阅创建新的 Observable
      const deferredCount$ = defer(() => of(++count))
      const values: number[] = []

      // 第一次订阅
      deferredCount$.subscribe(x => values.push(x))
      // 第二次订阅
      deferredCount$.subscribe(x => values.push(x))

      expect(values).toEqual([1, 2]) // 每次订阅都获得新的计数
    })

    it('generate - 循环生成值', () => {
      const values: number[] = []

      // 类似 for 循环的��式生成值
      generate({
        initialState: 0,
        condition: x => x < 3,
        iterate: x => x + 1,
        resultSelector: x => x * 2,
      }).subscribe(x => values.push(x))

      expect(values).toEqual([0, 2, 4])
    })

    it('range - 生成范围内的数字', () => {
      const values: number[] = []

      // 从 1 开始生成 3 个数字
      range(1, 3).subscribe(x => values.push(x))

      expect(values).toEqual([1, 2, 3])
    })
  })

  describe('条件类操作符', () => {
    it('every - 检查所有值是否满足条件', () => {
      const allEven = from([2, 4, 6, 8]).pipe(
        every(x => x % 2 === 0),
      )
      const hasOdd = from([2, 4, 5, 8]).pipe(
        every(x => x % 2 === 0),
      )

      allEven.subscribe(result => expect(result).toBe(true))
      hasOdd.subscribe(result => expect(result).toBe(false))
    })

    it('find/findIndex - 查找满足条件的值', () => {
      const source = from([1, 2, 3, 4, 5])

      source.pipe(
        find(x => x > 3),
      ).subscribe(value => expect(value).toBe(4))

      source.pipe(
        findIndex(x => x > 3),
      ).subscribe(index => expect(index).toBe(3))
    })

    it('isEmpty - 检查是否为空', () => {
      EMPTY.pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true))
      of(1).pipe(isEmpty()).subscribe(empty => expect(empty).toBe(false))
    })
  })

  describe('数学类操作符', () => {
    it('count - 计数操作符', () => {
      from([1, 2, 3, 4]).pipe(
        count(x => x % 2 === 0), // 计算偶数的个数
      ).subscribe(count => expect(count).toBe(2))
    })

    it('max/min - 最大最小值', () => {
      const numbers = [5, 3, 8, 2, 1]

      from(numbers).pipe(max()).subscribe(
        max => expect(max).toBe(8),
      )

      from(numbers).pipe(min()).subscribe(
        min => expect(min).toBe(1),
      )

      // 使用比较器
      const items = [
        { value: 5 },
        { value: 3 },
        { value: 8 },
      ]

      from(items).pipe(
        max((a, b) => a.value - b.value),
      ).subscribe(
        maxItem => expect(maxItem.value).toBe(8),
      )
    })
  })

  describe('工具类操作符', () => {
    it('timeInterval - 计算时间间隔', async () => {
      const values: { value: number, interval: number }[] = []

      interval(100).pipe(
        take(3),
        timeInterval(),
      ).subscribe(x => values.push(x))

      await vi.advanceTimersByTimeAsync(250)

      // 检查时间间隔
      expect(values.length).toBe(2)
      values.forEach((x) => {
        expect(x.interval).toBeGreaterThanOrEqual(100)
      })
    })

    it('timestamp - 添加时间戳', async () => {
      const values: { value: number, timestamp: number }[] = []
      const startTime = Date.now()

      interval(100).pipe(
        take(3),
        timestamp(),
      ).subscribe(x => values.push(x))

      await vi.advanceTimersByTimeAsync(250)

      values.forEach((x) => {
        expect(x.timestamp).toBeGreaterThanOrEqual(startTime)
      })
    })

    it('timeout 变体', async () => {
      const values: (number | string)[] = []

      // 基本超时
      const source1$ = new Observable<number>((subscriber) => {
        setTimeout(() => subscriber.next(1), 200)
      }).pipe(
        timeout(100),
      )

      // 带有替代值的超时
      const source2$ = new Observable<number>((subscriber) => {
        setTimeout(() => subscriber.next(1), 200)
      }).pipe(
        timeoutWith(100, of('超时后的值')),
      )

      source1$.subscribe({
        next: x => values.push(x),
        error: () => values.push('错误'),
      })

      source2$.subscribe(x => values.push(x))

      await vi.advanceTimersByTimeAsync(300)
      expect(values).toEqual(['错误', '超时后的值'])
    })
  })
})
