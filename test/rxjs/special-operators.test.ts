import type {
  Notification,
} from 'rxjs'
import {
  catchError,
  concatMap,
  connectable,
  defaultIfEmpty,
  dematerialize,
  EMPTY,
  exhaustMap,
  from,
  interval,
  materialize,
  mergeMap,
  Observable,
  of,
  onErrorResumeNext,
  share,
  Subject,
  switchMap,
  take,
  throwIfEmpty,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

describe('special RxJS Operators', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('多播变体', () => {
    it('connectable - 手动控制订阅时机', async () => {
      const values: number[] = []
      let subscribeCount = 0

      // 创建源 Observable
      const source$ = new Observable<number>((subscriber) => {
        subscribeCount++
        subscriber.next(1)
        subscriber.next(2)
        subscriber.complete()
      })

      // 创建可连接的 Observable
      const connectable$ = connectable(source$, {
        connector: () => new Subject(),
        resetOnDisconnect: true,
      })

      // 第一次订阅不会立即执行
      connectable$.subscribe(value => values.push(value))
      expect(subscribeCount).toBe(0)

      // 连接后开始执行
      const subscription = connectable$.connect()
      expect(subscribeCount).toBe(1)
      expect(values).toEqual([1, 2])

      // 取消订阅
      subscription.unsubscribe()
    })

    it('share - 高级配置', async () => {
      const values: number[] = []
      let subscribeCount = 0

      const source$ = new Observable<number>((subscriber) => {
        subscribeCount++
        subscriber.next(1)
        subscriber.next(2)
        subscriber.complete()
      })

      // 配置 share 操作符
      const shared$ = source$.pipe(
        share({
          resetOnError: true, // 错误时重置
          resetOnComplete: true, // 完成时重置
          resetOnRefCountZero: true, // 订阅数为0时重置
        }),
      )

      // 第一次订阅
      const sub1 = shared$.subscribe(value => values.push(value))
      expect(subscribeCount).toBe(1)

      // 取消第一次订阅
      sub1.unsubscribe()

      // 第二次订阅会重新执行，因为设置了 resetOnRefCountZero
      shared$.subscribe(value => values.push(value))
      expect(subscribeCount).toBe(2)

      expect(values).toEqual([1, 2, 1, 2])
    })
  })

  describe('高阶转换操作符', () => {
    it('xxxMap 操作符族 - 映射到固定的 Observable', async () => {
      const results: string[] = []
      const source$ = interval(100).pipe(take(2))
      const inner$ = of('固定值')

      // concatMap - 按顺序映射
      source$.pipe(
        concatMap(() => inner$),
      ).subscribe(x => results.push(`concat:${x}`))

      // mergeMap - 并行映射
      source$.pipe(
        mergeMap(() => inner$),
      ).subscribe(x => results.push(`merge:${x}`))

      // switchMap - 切换映射
      source$.pipe(
        switchMap(() => inner$),
      ).subscribe(x => results.push(`switch:${x}`))

      // exhaustMap - 忽略映射
      source$.pipe(
        exhaustMap(() => inner$),
      ).subscribe(x => results.push(`exhaust:${x}`))

      await vi.advanceTimersByTimeAsync(200)

      expect(results).toEqual([
        'concat:固定值',
        'merge:固定值',
        'switch:固定值',
        'exhaust:固定值',
        'concat:固定值',
        'merge:固定值',
        'switch:固定值',
        'exhaust:固定值',
      ])
    })
  })

  describe('错误处理操作符', () => {
    it('onErrorResumeNext - 忽略错误继续执行', () => {
      const values: (number | string)[] = []

      const error$ = new Observable<number>((subscriber) => {
        subscriber.next(1)
        subscriber.error(new Error('测试错误'))
      })

      const success$ = of('成功')

      onErrorResumeNext(
        error$,
        success$,
      ).subscribe(value => values.push(value))

      expect(values).toEqual([1, '成功']) // 错误被忽略，继续执行
    })

    it('catchError - 高级错误处理', () => {
      const values: (number | string)[] = []
      let errorCount = 0

      const source$ = new Observable<number>((subscriber) => {
        subscriber.next(1)
        subscriber.error(new Error('测试错误'))
      })

      source$.pipe(
        catchError((_error, caught) => {
          errorCount++
          if (errorCount < 2) {
            // 第一次错误时重试
            return caught
          }
          // 第二次错误时返回新的 Observable
          return of('错误处理完成')
        }),
      ).subscribe(value => values.push(value))

      expect(values).toEqual([1, 1, '错误处理完成'])
    })
  })

  describe('实用工具操作符', () => {
    it('materialize/dematerialize - 通知对象转换', () => {
      const values: any[] = []
      const notifications: Notification<number>[] = []

      // materialize - 转换为通知对象
      from([1, 2, 3]).pipe(
        materialize(),
      ).subscribe(notification => notifications.push(notification))

      // dematerialize - 从通知对象还原
      from(notifications).pipe(
        dematerialize(),
      ).subscribe(value => values.push(value))

      expect(values).toEqual([1, 2, 3])
    })

    it('defaultIfEmpty/throwIfEmpty - 空值处理', () => {
      const values1: number[] = []
      const values2: string[] = []

      // defaultIfEmpty - 提供默认值
      EMPTY.pipe(
        defaultIfEmpty(0),
      ).subscribe(value => values1.push(value))

      // throwIfEmpty - 空值时抛出错误
      EMPTY.pipe(
        throwIfEmpty(() => new Error('空值错误')),
        catchError(err => of(err.message)),
      ).subscribe(value => values2.push(value))

      expect(values1).toEqual([0])
      expect(values2).toEqual(['空值错误'])
    })
  })
})
