import { waitFor } from '@/promise'
import { concatMap, exhaustMap, from, interval, map, mergeMap, of, switchMap } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

/**
 * 比较 RxJS 中不同的 xxxMap 操作符的行为特点
 * 主要测试四种映射操作符:
 * - mergeMap: 并发执行所有内部 Observable
 * - concatMap: 串行执行内部 Observable
 * - switchMap: 切换到最新的内部 Observable
 * - exhaustMap: 忽略新值直到当前内部 Observable 完成
 */
describe('xxxMap vs xxxMap', () => {
  /**
   * mergeMap 的并发性:
   * 1. mergeMap 允许并发处理多个内部 Observable
   * 2. 当一个内部 Observable 还在进行时，下一个 interval 发射的值会立即被处理
   * 3. 最终输出 [1, 0] 的原因:
   *    - index=0 时启动一个延迟100ms的 Observable
   *    - index=1 时立即发出值1
   *    - 100ms后第一个 Observable 完成,输出0
   */
  it('mergeMap', async () => {
    vi.useFakeTimers()
    const values: number[] = []
    const subscription = interval(100).pipe(
      mergeMap((value, index) => {
        if (index === 1) {
          return of(value)
        }
        return from(waitFor(100)).pipe(map(() => value))
      }),
    ).subscribe({
      next: (value) => {
        values.push(value)
      },
    })

    await vi.advanceTimersByTimeAsync(300)
    subscription.unsubscribe()
    expect(values).toEqual([1, 0])
  })

  /**
   * concatMap 的串行性:
   * 1. concatMap 会等待前一个内部 Observable 完成后，才会处理下一个值
   * 2. 保证了处理顺序与源 Observable 发出值的顺序一致
   * 3. 最终输出 [0, 1] 的原因:
   *    - index=0 的 Observable 延迟100ms后输出0
   *    - 然后处理 index=1,立即输出1
   */
  it('contactMap', async () => {
    vi.useFakeTimers()
    const values: number[] = []
    const subscription = interval(100).pipe(
      concatMap((value, index) => {
        if (index === 1) {
          return of(value)
        }
        return from(waitFor(100)).pipe(map(() => value))
      }),
    ).subscribe({
      next: (value) => {
        values.push(value)
      },
    })

    await vi.advanceTimersByTimeAsync(300)
    subscription.unsubscribe()
    expect(values).toEqual([0, 1])
  })

  /**
   * switchMap 的切换性:
   * 1. switchMap 会在收到新的源值时取消前一个内部 Observable 的订阅
   * 2. 只保留最新的内部 Observable 的结果
   * 3. 最终只输出 [1] 的原因:
   *    - index=0 启动延迟100ms的 Observable
   *    - 100ms时收到 index=1,取消前一个 Observable
   *    - index=1 立即输出值1
   */
  it('switchMap', async () => {
    vi.useFakeTimers()
    const values: number[] = []
    const subscription = interval(100).pipe(
      switchMap((value, index) => {
        if (index === 1) {
          return of(value)
        }
        return from(waitFor(100)).pipe(map(() => value))
      }),
    ).subscribe({
      next: (value) => {
        values.push(value)
      },
    })

    await vi.advanceTimersByTimeAsync(300)
    subscription.unsubscribe()
    expect(values).toEqual([1])
  })

  /**
   * exhaustMap 的防抖性:
   * 1. exhaustMap 会在处理内部 Observable 时忽略源 Observable 发出的新值
   * 2. 直到当前内部 Observable 完成才会处理新的值
   * 3. 最终输出 [0, 2] 的原因:
   *    - index=0 启动延迟100ms的 Observable
   *    - 100ms时收到 index=1，但被忽略，因为当前 Observable 还未完成
   *    - 200ms时，index=0 的 Observable 完成并输出 0
   *    - 同时收到 index=2，开始新的延迟100ms的 Observable
   *    - 300ms时，index=2 的 Observable 完成并输出 2
   */
  it('exhaustMap', async () => {
    vi.useFakeTimers()
    const values: number[] = []
    const subscription = interval(100).pipe(
      exhaustMap((value, index) => {
        if (index === 1) {
          return of(value)
        }
        return from(waitFor(100)).pipe(map(() => value))
      }),
    ).subscribe({
      next: (value) => {
        values.push(value)
      },
    })

    await vi.advanceTimersByTimeAsync(300)
    subscription.unsubscribe()
    expect(values).toEqual([0, 2])
  })
})
