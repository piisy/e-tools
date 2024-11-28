import type {
  Observable,
} from 'rxjs'
import {
  buffer,
  bufferCount,
  combineLatest,
  filter,
  first,
  from,
  interval,
  last,
  map,
  mergeMap,
  reduce,
  scan,
  single,
  skip,
  Subject,
  take,
  takeUntil,
  takeWhile,
  tap,
  toArray,
  window,
  withLatestFrom,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

/**
 * RxJS 操作符对比测试
 * 通过对比相似操作符的行为来理解它们的区别
 */
describe('rxJS Operator Comparisons', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('转换操作符对比', () => {
    it('map vs tap - map转换值而tap不改变值', () => {
      const mapValues: number[] = []
      const tapValues: number[] = []
      const sideEffects: number[] = []

      from([1, 2, 3]).pipe(
        map(x => x * 2),
      ).subscribe(x => mapValues.push(x))

      from([1, 2, 3]).pipe(
        tap(x => sideEffects.push(x * 2)),
      ).subscribe(x => tapValues.push(x))

      expect(mapValues).toEqual([2, 4, 6]) // map 改变了值
      expect(tapValues).toEqual([1, 2, 3]) // tap 不改变值
      expect(sideEffects).toEqual([2, 4, 6]) // tap 的副作用
    })

    it('scan vs reduce - scan发出中间值而reduce只发出最终值', () => {
      const scanValues: number[] = []
      const reduceValues: number[] = []

      from([1, 2, 3, 4]).pipe(
        scan((acc, curr) => acc + curr, 0),
      ).subscribe(x => scanValues.push(x))

      from([1, 2, 3, 4]).pipe(
        reduce((acc, curr) => acc + curr, 0),
      ).subscribe(x => reduceValues.push(x))

      expect(scanValues).toEqual([1, 3, 6, 10]) // 发出所有中间值
      expect(reduceValues).toEqual([10]) // 只发出最终值
    })
  })

  describe('过滤操作符对比', () => {
    it('filter vs take vs skip', () => {
      const filterValues: number[] = []
      const takeValues: number[] = []
      const skipValues: number[] = []

      from([1, 2, 3, 4, 5]).pipe(
        filter(x => x % 2 === 0),
      ).subscribe(x => filterValues.push(x))

      from([1, 2, 3, 4, 5]).pipe(
        take(3),
      ).subscribe(x => takeValues.push(x))

      from([1, 2, 3, 4, 5]).pipe(
        skip(2),
      ).subscribe(x => skipValues.push(x))

      expect(filterValues).toEqual([2, 4]) // 基于条件过滤
      expect(takeValues).toEqual([1, 2, 3]) // 取前3个
      expect(skipValues).toEqual([3, 4, 5]) // 跳过前2个
    })

    it('takeUntil vs takeWhile - 不同的终止条件', async () => {
      const untilValues: number[] = []
      const whileValues: number[] = []
      const stop$ = new Subject<void>()

      interval(100).pipe(
        takeUntil(stop$),
      ).subscribe(x => untilValues.push(x))

      interval(100).pipe(
        takeWhile(x => x < 3),
      ).subscribe(x => whileValues.push(x))

      await vi.advanceTimersByTimeAsync(250)
      stop$.next() // 发出停止信号
      await vi.advanceTimersByTimeAsync(100)

      expect(untilValues).toEqual([0, 1]) // 直到信号才停止
      expect(whileValues).toEqual([0, 1, 2]) // 当条件为假时停止
    })

    it('first vs last vs single', () => {
      const source = from([1, 2, 3, 4])

      // first() - 取第一个值
      source.pipe(first()).subscribe((x) => {
        expect(x).toBe(1)
      })

      // last() - 取最后一个值
      source.pipe(last()).subscribe((x) => {
        expect(x).toBe(4)
      })

      // single() - 确保只有一个值满足条件
      source.pipe(
        single(x => x === 3),
      ).subscribe((x) => {
        expect(x).toBe(3)
      })
    })
  })

  describe('组合操作符对比', () => {
    it('withLatestFrom vs combineLatest', async () => {
      const withLatestValues: number[][] = []
      const combineValues: number[][] = []

      const source$ = interval(100)
      const other$ = interval(150)

      // withLatestFrom 只在源 Observable 发出值时组合
      source$.pipe(
        withLatestFrom(other$),
      ).subscribe(value => withLatestValues.push(value))

      // combineLatest 在任意输入 Observable 发出值时组合
      combineLatest([source$, other$]).subscribe(
        value => combineValues.push(value),
      )

      await vi.advanceTimersByTimeAsync(300)

      // withLatestFrom 输出较少，因为只在 source$ 发出值时才组合
      expect(withLatestValues.length).toBeLessThan(combineValues.length)
    })
  })

  describe('缓存操作符对比', () => {
    it('buffer vs bufferCount', async () => {
      const bufferValues: number[][] = []
      const bufferCountValues: number[][] = []

      const source$ = interval(100)
      const signal$ = interval(250)

      // buffer - 基于信号缓存
      source$.pipe(
        buffer(signal$),
      ).subscribe(value => bufferValues.push(value))

      // bufferCount - 基于数量缓存
      source$.pipe(
        bufferCount(2),
      ).subscribe(value => bufferCountValues.push(value))

      await vi.advanceTimersByTimeAsync(500)

      // buffer 输出: [[0,1], [2,3,4]]
      expect(bufferValues).toEqual([[0, 1], [2, 3, 4]])
      // bufferCount 输出: [[0,1], [2,3], [4]]
      expect(bufferCountValues).toEqual([[0, 1], [2, 3]])
    })

    it('window vs buffer - window 发出 Observable', async () => {
      const windowValues: number[][] = []
      const bufferValues: number[][] = []
      const source$ = interval(100)
      const signal$ = interval(250)

      // window 发出 Observable
      source$.pipe(
        window(signal$),
        // 需要订阅内部 Observable 来获取值
        mergeMap((win$: Observable<number>) => win$.pipe(toArray())),
      ).subscribe(values => windowValues.push(values))

      // buffer 直接发出值数组
      source$.pipe(
        buffer(signal$),
      ).subscribe(values => bufferValues.push(values))

      await vi.advanceTimersByTimeAsync(500)

      // 两者的输出结果相同，但处理方式不同
      expect(windowValues).toEqual(bufferValues)
    })
  })
})
