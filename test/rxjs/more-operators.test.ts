import {
  asyncScheduler,
  audit,
  delay,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  endWith,
  from,
  interval,
  Observable,
  observeOn,
  pairwise,
  repeat,
  repeatWhen,
  retryWhen,
  sample,
  startWith,
  take,
  tap,
  throttle,
  timer,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

/**
 * 更多 RxJS 操作符测试
 * 参考: https://rxjs.dev/api
 */
describe('more RxJS Operators', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('调度器操作符', () => {
    it('observeOn vs subscribeOn - 不同的调度时机', async () => {
      const values: string[] = []
      const source$ = new Observable<number>((subscriber) => {
        values.push('订阅')
        subscriber.next(1)
        subscriber.complete()
      })

      // observeOn - 影响值的发送时机
      source$.pipe(
        tap(() => values.push('tap1')),
        observeOn(asyncScheduler),
        tap(() => values.push('tap2')),
      ).subscribe({
        next: () => values.push('next'),
        complete: () => values.push('complete'),
      })

      // 同步执行部分
      expect(values).toEqual(['订阅', 'tap1'])

      // 异步执行部分
      await vi.runAllTimersAsync()
      expect(values).toEqual(['订阅', 'tap1', 'tap2', 'next', 'complete'])
    })
  })

  describe('错误重试操作符', () => {
    it('retryWhen - 自定义重试逻辑', async () => {
      let attempts = 0
      const values: number[] = []
      const errors: string[] = []

      const source$ = new Observable<number>((subscriber) => {
        attempts++
        subscriber.next(attempts)
        if (attempts < 3) {
          subscriber.error(new Error(`错误 ${attempts}`))
        }
        subscriber.complete()
      })

      source$.pipe(
        retryWhen(errors$ =>
          errors$.pipe(
            // 延迟 100ms 后重试
            delay(100),
            // 最多重试 2 次
            take(2),
          ),
        ),
      ).subscribe({
        next: value => values.push(value),
        error: err => errors.push(err.message),
        complete: () => values.push(-1),
      })

      await vi.runAllTimersAsync()
      expect(values).toEqual([1, 2, 3, -1])
      expect(attempts).toBe(3)
    })

    it('repeat vs repeatWhen - 重复执行', async () => {
      const values: number[] = []

      // repeat - 简单重复
      from([1, 2]).pipe(
        repeat(2),
      ).subscribe(x => values.push(x))

      // repeatWhen - 自定义重复逻辑
      const customRepeat$ = from([3, 4]).pipe(
        repeatWhen(completed$ =>
          completed$.pipe(
            // 延迟 100ms 后重复
            delay(100),
            take(1),
          ),
        ),
      )

      customRepeat$.subscribe(x => values.push(x))
      await vi.runAllTimersAsync()

      expect(values).toEqual([1, 2, 1, 2, 3, 4, 3, 4])
    })
  })

  describe('背压控制操作符', () => {
    it('sample vs audit vs throttle - 不同的取样策略', async () => {
      const sampleValues: number[] = []
      const auditValues: number[] = []
      const throttleValues: number[] = []

      const source$ = interval(100)
      const sampler$ = interval(250)

      // sample - 取最新值
      source$.pipe(
        sample(sampler$),
        take(2),
      ).subscribe(x => sampleValues.push(x))

      // audit - 忽略指定时间内的值
      source$.pipe(
        audit(() => timer(250)),
        take(2),
      ).subscribe(x => auditValues.push(x))

      // throttle - 可配置是否取第一个还是最后一个值
      source$.pipe(
        throttle(() => timer(250), {
          leading: true, // 取第一个值
          trailing: true, // 取最后一个值
        }),
        take(2),
      ).subscribe(x => throttleValues.push(x))

      await vi.advanceTimersByTimeAsync(600)

      expect(sampleValues.length).toBe(2)
      expect(auditValues.length).toBe(1)
      expect(throttleValues.length).toBe(2)
    })
  })

  describe('转换操作符', () => {
    it('pairwise - 成对发出值', () => {
      const values: number[][] = []

      from([1, 2, 3, 4]).pipe(
        pairwise(),
      ).subscribe(pair => values.push(pair))

      expect(values).toEqual([[1, 2], [2, 3], [3, 4]])
    })

    it('startWith & endWith - 添加首尾值', () => {
      const values: number[] = []

      from([2, 3]).pipe(
        startWith(1),
        endWith(4),
      ).subscribe(x => values.push(x))

      expect(values).toEqual([1, 2, 3, 4])
    })

    it('distinct 变体的不同行为', () => {
      const source = [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
        { id: 2, name: 'B' },
        { id: 2, name: 'B' },
      ]

      const distinctValues: any[] = []
      const distinctUntilChangedValues: any[] = []
      const distinctUntilKeyChangedValues: any[] = []

      // distinct - 基于值的完全去重
      from(source).pipe(
        distinct(item => item.id),
      ).subscribe(x => distinctValues.push(x))

      // distinctUntilChanged - 去除连续重复值
      from(source).pipe(
        distinctUntilChanged((prev, curr) => prev.id === curr.id),
      ).subscribe(x => distinctUntilChangedValues.push(x))

      // distinctUntilKeyChanged - 基于键的连续去重
      from(source).pipe(
        distinctUntilKeyChanged('name'),
      ).subscribe(x => distinctUntilKeyChangedValues.push(x))

      expect(distinctValues.length).toBe(2) // 只有两个不同的 id
      expect(distinctUntilChangedValues.length).toBe(2) // id 变化了一次
      expect(distinctUntilKeyChangedValues.length).toBe(2) // name 变化了一次
    })
  })
})
