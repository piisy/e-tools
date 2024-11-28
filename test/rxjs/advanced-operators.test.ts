import {
  buffer,
  catchError,
  combineLatest,
  from,
  interval,
  map,
  merge,
  Observable,
  of,
  retry,
  scan,
  Subject,
  takeUntil,
  takeWhile,
  zip,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

/**
 * RxJS 高级操作符测试
 * 主要测试:
 * 1. 组合操作符 (combineLatest, merge, zip)
 * 2. 转换操作符 (scan, buffer)
 * 3. 条件操作符 (takeUntil, takeWhile)
 * 4. 错误处理操作符 (catchError, retry)
 */
describe('rxJS Advanced Operators', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('组合操作符', () => {
    it('combineLatest - 组合多个 Observable 的最新值', async () => {
      const values: number[][] = []

      // 创建两个不同速率的 Observable
      const fast$ = interval(100).pipe(map(x => x + 1))
      const slow$ = interval(200).pipe(map(x => (x + 1) * 10))

      combineLatest([fast$, slow$]).subscribe(value => values.push(value))

      await vi.advanceTimersByTimeAsync(250)

      // [1,null] - fast=1, slow=null //ignore
      // [2,10] - fast=2, slow=10
      expect(values).toEqual([[2, 10]])
    })

    it('merge - 合并多个 Observable', async () => {
      const values: number[] = []

      const first$ = interval(100).pipe(map(x => x + 1))
      const second$ = interval(150).pipe(map(x => (x + 1) * 10))

      merge(first$, second$).subscribe(value => values.push(value))

      await vi.advanceTimersByTimeAsync(250)

      // 100ms: 1
      // 150ms: 10
      // 200ms: 2
      expect(values).toEqual([1, 10, 2])
    })

    it('zip - 按顺序组合值', () => {
      const values: number[][] = []

      const numbers$ = of(1, 2, 3)
      const multipliers$ = of(10, 20, 30)

      zip(numbers$, multipliers$).subscribe(value => values.push(value))

      expect(values).toEqual([[1, 10], [2, 20], [3, 30]])
    })
  })

  describe('转换操作符', () => {
    it('scan - 累积值', () => {
      const values: number[] = []

      from([1, 2, 3, 4]).pipe(
        scan((acc, curr) => acc + curr, 0), // 累加
      ).subscribe(value => values.push(value))

      // 每次累加的结果: 1, 3, 6, 10
      expect(values).toEqual([1, 3, 6, 10])
    })

    it('buffer - 缓存值直到信号', async () => {
      const values: number[][] = []

      const source$ = interval(100)
      const signal$ = interval(250)

      source$.pipe(
        buffer(signal$),
      ).subscribe(value => values.push(value))

      await vi.advanceTimersByTimeAsync(500)

      // 250ms: [0,1]
      // 500ms: [2,3,4]
      expect(values).toEqual([[0, 1], [2, 3, 4]])
    })
  })

  describe('条件操作符', () => {
    it('takeUntil - 直到信号才停止', async () => {
      const values: number[] = []
      const stop$ = new Subject<void>()

      interval(100).pipe(
        takeUntil(stop$),
      ).subscribe(value => values.push(value))

      await vi.advanceTimersByTimeAsync(250)
      stop$.next() // 发出停止信号
      await vi.advanceTimersByTimeAsync(100)

      expect(values).toEqual([0, 1])
    })

    it('takeWhile - 当条件为真时取值', () => {
      const values: number[] = []

      from([1, 2, 3, 4, 5, 1, 2]).pipe(
        takeWhile(x => x < 4), // 取小于4的值
      ).subscribe(value => values.push(value))

      expect(values).toEqual([1, 2, 3])
    })
  })

  describe('错误处理操作符', () => {
    it('catchError - 捕获并处理错误', () => {
      const values: (number | string)[] = []

      const error$ = new Observable<number>((subscriber) => {
        subscriber.next(1)
        subscriber.next(2)
        subscriber.error(new Error('测试错误'))
      })

      error$.pipe(
        catchError(err => of(`错误已处理: ${err.message}`)),
      ).subscribe(value => values.push(value))

      expect(values).toEqual([1, 2, '错误已处理: 测试错误'])
    })

    it('retry - 重试失败的 Observable', async () => {
      const values: number[] = []
      let attempts = 0

      const flaky$ = new Observable<number>((subscriber) => {
        attempts++
        subscriber.next(attempts)
        if (attempts < 3) {
          subscriber.error(new Error('失败'))
        }
        subscriber.complete()
      })

      flaky$.pipe(
        retry(2), // 最多重试2次
      ).subscribe({
        next: value => values.push(value),
        error: () => values.push(-1),
      })

      // 第一次尝试: 1 -> 错误
      // 第二次尝试: 2 -> 错误
      // 第三次尝试: 3 -> 成功
      expect(values).toEqual([1, 2, 3])
      expect(attempts).toBe(3)
    })
  })
})
