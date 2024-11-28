import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs'
import { describe, expect, it } from 'vitest'

/**
 * RxJS Subject 测试
 * 主要测试:
 * 1. 基本的 Subject
 * 2. BehaviorSubject
 * 3. ReplaySubject
 */
describe('rxJS Subjects', () => {
  it('基本的 Subject', () => {
    const values1: number[] = []
    const values2: number[] = []

    const subject = new Subject<number>()

    // 第一个订阅者
    subject.subscribe(value => values1.push(value))

    subject.next(1)
    subject.next(2)

    // 第二个订阅者 - 只能收到订阅后的值
    subject.subscribe(value => values2.push(value))

    subject.next(3)
    subject.complete()

    expect(values1).toEqual([1, 2, 3])
    expect(values2).toEqual([3]) // 只收到最后一个值
  })

  it('behaviorSubject', () => {
    const values: number[] = []

    const subject = new BehaviorSubject<number>(0) // 初始值为 0

    // 新订阅者会立即收到当前值
    subject.subscribe(value => values.push(value))

    subject.next(1)
    subject.next(2)

    expect(values).toEqual([0, 1, 2]) // 包含初始值
    expect(subject.getValue()).toBe(2) // 可以直接获取当前值
  })

  it('replaySubject', () => {
    const values: number[] = []

    const subject = new ReplaySubject<number>(2) // 缓存最后 2 个值

    subject.next(1)
    subject.next(2)
    subject.next(3)

    // 新订阅者会收到最后 2 个值
    subject.subscribe(value => values.push(value))

    subject.next(4)

    expect(values).toEqual([2, 3, 4]) // 收到最后 2 个缓存值和新值
  })
})
