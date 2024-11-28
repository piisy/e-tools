import {
  debounceTime,
  delay,
  delayWhen,
  EMPTY,
  expand,
  from,
  groupBy,
  iif,
  interval,
  map,
  mergeMap,
  mergeScan,
  multicast,
  Observable,
  of,
  partition,
  refCount,
  share,
  shareReplay,
  Subject,
  take,
  throttleTime,
  timer,
  toArray,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

describe('rxJS Advanced Usage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('多播操作符', () => {
    it('share vs shareReplay - 共享执行但处理方式不同', async () => {
      let count = 0
      const source$ = new Observable<number>((subscriber) => {
        count++
        subscriber.next(count)
        subscriber.complete()
      })

      // share - 不会为后来的订阅者重放值
      const shared$ = source$.pipe(share())
      const shareValues1: number[] = []
      const shareValues2: number[] = []

      shared$.subscribe(x => shareValues1.push(x))
      shared$.subscribe(x => shareValues2.push(x))

      // shareReplay - 会为后来的订阅者重放指定数量的值
      const replayed$ = source$.pipe(shareReplay(1))
      const replayValues1: number[] = []
      const replayValues2: number[] = []

      replayed$.subscribe(x => replayValues1.push(x))
      replayed$.subscribe(x => replayValues2.push(x))

      expect(shareValues1).toEqual([1])
      expect(shareValues2).toEqual([2]) // 第二个订阅者没有收到值
      expect(replayValues1).toEqual([3])
      expect(replayValues2).toEqual([3]) // 第二个订阅者收到了重放的值
    })

    it('publish 和 multicast - 更细粒度的控制', () => {
      const source$ = interval(100).pipe(take(3))
      const subject = new Subject<number>()
      const values: number[] = []

      // multicast 允许使用自定义的 Subject
      const multicasted$ = source$.pipe(
        multicast(subject),
        // 需要调用 connect() 开始执行
        refCount(),
      )

      multicasted$.subscribe(x => values.push(x))

      vi.advanceTimersByTime(350)
      expect(values).toEqual([0, 1, 2])
    })
  })

  describe('时间控制操作符', () => {
    it('debounceTime vs throttleTime - 不同的节流策略', async () => {
      const values1: number[] = []
      const values2: number[] = []
      const source$ = new Subject<number>()

      // debounceTime - 等待指定时间内没有新值才发出
      source$.pipe(
        debounceTime(100),
      ).subscribe(x => values1.push(x))

      // throttleTime - 按固定时间间隔发出值
      source$.pipe(
        throttleTime(100),
      ).subscribe(x => values2.push(x))

      source$.next(1)
      await vi.advanceTimersByTimeAsync(50)
      source$.next(2)
      await vi.advanceTimersByTimeAsync(50)
      source$.next(3)
      await vi.advanceTimersByTimeAsync(150)

      expect(values1).toEqual([3]) // 只有最后一个值
      expect(values2).toEqual([1, 3]) // 第一个值后的 100ms 内的值被忽略
    })

    it('delay vs delayWhen - 固定延迟vs动态延迟', async () => {
      const values1: number[] = []
      const values2: number[] = []

      // delay - 固定延迟时间
      from([1, 2, 3]).pipe(
        delay(100),
      ).subscribe(x => values1.push(x))

      // delayWhen - 根据值动态决定延迟时间
      from([1, 2, 3]).pipe(
        delayWhen(x => timer(x * 100)),
      ).subscribe(x => values2.push(x))

      await vi.advanceTimersByTimeAsync(400)

      expect(values1).toEqual([1, 2, 3]) // 所有值同时延迟100ms
      expect(values2).toEqual([1, 2, 3]) // 每个值有不同的延迟
    })
  })

  describe('条件分支操作符', () => {
    it('iif - 条件执行不同的 Observable', () => {
      const values: number[] = []
      const condition = true

      iif(
        () => condition,
        of(1, 2, 3), // 条件为真时执行
        of(4, 5, 6), // 条件为假时执行
      ).subscribe(x => values.push(x))

      expect(values).toEqual([1, 2, 3])
    })

    it('partition - 根据条件分割 Observable', () => {
      const [even$, odd$] = partition(
        from([1, 2, 3, 4, 5]),
        x => x % 2 === 0,
      )

      const evenValues: number[] = []
      const oddValues: number[] = []

      even$.subscribe(x => evenValues.push(x))
      odd$.subscribe(x => oddValues.push(x))

      expect(evenValues).toEqual([2, 4])
      expect(oddValues).toEqual([1, 3, 5])
    })
  })

  describe('高阶 Observable 操作符', () => {
    it('expand - 递归生成 Observable', () => {
      const values: number[] = []

      of(1).pipe(
        expand(x => x < 4 ? of(x + 1) : EMPTY),
        take(3),
      ).subscribe(x => values.push(x))

      expect(values).toEqual([1, 2, 3])
    })

    it('mergeScan - 累积值并合并 Observable', async () => {
      const values: number[] = []

      interval(100).pipe(
        take(3),
        mergeScan((acc, curr) =>
          of(acc + curr), // 返回新的 Observable
        0),
      ).subscribe(x => values.push(x))

      await vi.advanceTimersByTimeAsync(300)
      expect(values).toEqual([0, 1, 3]) // 0, 0+1, (0+1)+2
    })

    it('groupBy - 根据键值分组', () => {
      const source = from([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
      ])

      const groups: Record<number, string[]> = {}

      source.pipe(
        groupBy(item => item.id),
        mergeMap(group =>
          group.pipe(
            map(item => item.name),
            toArray(),
          ).pipe(
            map(names => ({ id: group.key, names })),
          ),
        ),
      ).subscribe(({ id, names }) => {
        groups[id] = names
      })

      expect(groups).toEqual({
        1: ['A', 'C'],
        2: ['B'],
      })
    })
  })
})
