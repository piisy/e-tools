import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  from,
  map,
  Observable,
  observeOn,
  of,
  queueScheduler,
  scheduled,
} from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, it, vi } from 'vitest'

describe('rxJS Testing and Async', () => {
  describe('调度器深入使用', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })
    it('不同调度器的特点', async () => {
      const values: string[] = []
      const source = of(1, 2, 3)

      // async - 宏任务调度器
      source.pipe(
        observeOn(asyncScheduler),
        map(x => `async:${x}`),
      ).subscribe(x => values.push(x))

      // asap - 微任务调度器
      source.pipe(
        observeOn(asapScheduler),
        map(x => `asap:${x}`),
      ).subscribe(x => values.push(x))

      // queue - 同步递归调度器
      source.pipe(
        observeOn(queueScheduler),
        map(x => `queue:${x}`),
      ).subscribe(x => values.push(x))

      // animationFrame - 动画帧调度器
      source.pipe(
        observeOn(animationFrameScheduler),
        map(x => `animation:${x}`),
      ).subscribe(x => values.push(x))

      await vi.runAllTimersAsync()

      // queue 是同步的，会最先执行
      expect(values.some(x => x.startsWith('queue'))).toBe(true)
      // 其他调度器是异步的
      expect(values.some(x => x.startsWith('async'))).toBe(true)
      expect(values.some(x => x.startsWith('asap'))).toBe(true)
      expect(values.some(x => x.startsWith('animation'))).toBe(true)
    })

    it('scheduled - 使用调度器创建 Observable', async () => {
      const values: number[] = []

      // 使用 scheduled 创建有调度的 Observable
      scheduled([1, 2, 3], asyncScheduler).subscribe(x => values.push(x))

      expect(values).toEqual([]) // 同步时为空
      await vi.runAllTimersAsync()
      expect(values).toEqual([1, 2, 3]) // 异步执行后有值
    })
  })

  describe('弹珠测试', () => {
    let testScheduler: TestScheduler

    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected)
      })
    })

    it('基本的弹珠测试', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const source$ = cold('a-b-c|', { a: 1, b: 2, c: 3 })
        const expected = 'a-b-c|'
        expectObservable(source$).toBe(expected, { a: 1, b: 2, c: 3 })
      })
    })

    it('操作符的弹珠测试', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const source$ = cold('a-b-c|', { a: 1, b: 2, c: 3 })
        const result$ = source$.pipe(
          map(x => x * 2),
        )
        const expected = 'a-b-c|'
        expectObservable(result$).toBe(expected, { a: 2, b: 4, c: 6 })
      })
    })
  })

  describe('自定义操作符', () => {
    it('创建自定义操作符', () => {
      // 自定义操作符：对值进行平方
      function square<T extends number>() {
        return (source: Observable<T>) =>
          new Observable<number>((subscriber) => {
            return source.subscribe({
              next(value) {
                subscriber.next(value * value)
              },
              error(err) {
                subscriber.error(err)
              },
              complete() {
                subscriber.complete()
              },
            })
          })
      }

      const values: number[] = []
      from([1, 2, 3]).pipe(
        square(),
      ).subscribe(x => values.push(x))

      expect(values).toEqual([1, 4, 9])
    })

    it('使用已有操作符创建新操作符', () => {
      // 自定义操作符：重复值指定次数
      function repeatValue<T>(count: number) {
        return (source: Observable<T>) =>
          source.pipe(
            map(value => Array.from({ length: count }).fill(value)),
            map(arr => arr.join(',')),
          )
      }

      const values: string[] = []
      from([1, 2]).pipe(
        repeatValue(3),
      ).subscribe(x => values.push(x))

      expect(values).toEqual(['1,1,1', '2,2,2'])
    })
  })

  describe('错误处理模式', () => {
    it('重试策略模式', async () => {
      vi.useFakeTimers()
      const values: (number | string)[] = []
      let attempts = 0

      const source$ = new Observable<number>((subscriber) => {
        attempts++
        if (attempts === 1) {
          subscriber.error(new Error('网络错误'))
        }
        else if (attempts === 2) {
          subscriber.error(new Error('服务器错误'))
        }
        else {
          subscriber.next(attempts)
          subscriber.complete()
        }
      })

      // 实现渐进式重试策略
      const retryWithDelay = (maxRetries: number, initialDelay: number) => {
        return (source: Observable<any>) =>
          new Observable((subscriber) => {
            let retries = 0
            let delay = initialDelay

            function subscribe() {
              source.subscribe({
                next(value) {
                  subscriber.next(value)
                },
                error(err) {
                  if (retries < maxRetries) {
                    retries++
                    delay *= 2 // 指数退避
                    setTimeout(subscribe, delay)
                  }
                  else {
                    subscriber.error(err)
                  }
                },
                complete() {
                  subscriber.complete()
                },
              })
            }

            subscribe()
          })
      }

      source$.pipe(
        retryWithDelay(2, 100),
      ).subscribe({
        next: value => values.push(value),
        error: err => values.push(err.message),
      })

      await vi.runAllTimersAsync()
      expect(values).toEqual([3])
      expect(attempts).toBe(3)
    })
  })
})
