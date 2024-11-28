import { EMPTY, from, NEVER, Observable, of, throwError } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

/**
 * RxJS 基础概念测试
 * 主要测试:
 * 1. Observable 的创建方式
 * 2. 订阅和取消订阅
 * 3. 完成和错误处理
 */
describe('rxJS Basics', () => {
  it('创建和订阅 Observable', () => {
    const values: number[] = []

    // 使用 Observable 构造函数创建
    const observable = new Observable<number>((subscriber) => {
      subscriber.next(1)
      subscriber.next(2)
      subscriber.next(3)
      subscriber.complete()
    })

    // 订阅 Observable
    observable.subscribe({
      next: value => values.push(value),
      complete: () => values.push(-1), // 用 -1 标记完成
    })

    expect(values).toEqual([1, 2, 3, -1])
  })

  it('使用创建操作符', () => {
    const values: number[] = []

    // of 操作符 - 同步发出一组值
    of(1, 2, 3).subscribe(value => values.push(value))
    expect(values).toEqual([1, 2, 3])

    // from 操作符 - 从数组创建
    const array$ = from([4, 5, 6])
    array$.subscribe(value => values.push(value))
    expect(values).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('错误处理', () => {
    const values: (number | string)[] = []

    // throwError 操作符 - 直接抛出错误
    throwError(() => new Error('测试错误')).subscribe({
      error: err => values.push(err.message),
    })
    expect(values).toEqual(['测试错误'])

    // 处理 Observable 中的错误
    const error$ = new Observable<number>((subscriber) => {
      subscriber.next(1)
      subscriber.error(new Error('Observable 错误'))
    })

    error$.subscribe({
      next: value => values.push(value),
      error: err => values.push(err.message),
    })

    expect(values).toEqual(['测试错误', 1, 'Observable 错误'])
  })

  it('特殊的 Observable', () => {
    const values: number[] = []

    // EMPTY - 立即完成的 Observable
    EMPTY.subscribe({
      complete: () => values.push(1),
    })
    expect(values).toEqual([1])

    // NEVER - 永不完成的 Observable
    const subscription = NEVER.subscribe({
      complete: () => values.push(2),
    })

    subscription.unsubscribe() // 需要手动取消订阅
    expect(values).toEqual([1]) // 不会有新值加入
  })

  it('取消订阅', () => {
    vi.useFakeTimers()
    const values: number[] = []

    // 创建一个持续发送值的 Observable
    const infinite$ = new Observable<number>((subscriber) => {
      let count = 0
      const timer = setInterval(() => {
        subscriber.next(count++)
      }, 1000)

      // 清理函数
      return () => {
        clearInterval(timer)
        values.push(-1) // 标记清理函数被调用
      }
    })

    const subscription = infinite$.subscribe(value => values.push(value))

    vi.advanceTimersByTime(2500) // 推进时间
    subscription.unsubscribe() // 取消订阅

    expect(values).toEqual([0, 1, -1])
  })
})
