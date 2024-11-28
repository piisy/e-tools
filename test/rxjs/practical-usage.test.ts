import {
  BehaviorSubject,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  of,
  retry,
  scan,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

describe('rxJS Practical Usage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('实际应用场景', () => {
    it('搜索建议实现', async () => {
      const searchResults: string[][] = []
      const searchInput$ = new Subject<string>()

      // 模拟 API 调用
      const mockSearch = (query: string) =>
        of([`${query} result 1`, `${query} result 2`]).pipe(
          delay(100), // 模拟网络延迟
        )

      // 实现搜索建议
      searchInput$.pipe(
        debounceTime(300), // 等待用户停止输入
        distinctUntilChanged(), // 避免重复搜索
        switchMap(query => mockSearch(query)), // 取消旧的搜索请求
      ).subscribe(results => searchResults.push(results))

      // 模拟用户输入
      searchInput$.next('a')
      await vi.advanceTimersByTimeAsync(200)
      searchInput$.next('ab')
      await vi.advanceTimersByTimeAsync(400)

      expect(searchResults).toEqual([['ab result 1', 'ab result 2']])
    })

    it('轮询实现', async () => {
      const values: number[] = []
      let pollCount = 0

      // 模拟 API 调用
      const mockApi = () => of(++pollCount).pipe(delay(100))

      // 实现轮询
      const polling$ = timer(0, 1000).pipe(
        switchMap(() => mockApi()),
        retry(), // 错误时重试
        takeUntil(timer(2500)), // 在2.5秒后停止
      )

      polling$.subscribe(value => values.push(value))

      await vi.advanceTimersByTimeAsync(3000)
      expect(values).toEqual([1, 2, 3])
    })

    it('缓存实现', async () => {
      vi.useRealTimers()
      let apiCallCount = 0
      const cache = new Map<string, string>()

      // 模拟 API 调用
      const mockApi = (id: string) => {
        apiCallCount++
        return of(`data-${id}`).pipe(delay(100))
      }

      // 实现缓存层
      function getCachedData(id: string) {
        return new Observable<string>((subscriber) => {
          const cached = cache.get(id)
          if (cached) {
            subscriber.next(cached)
            subscriber.complete()
          }
          else {
            mockApi(id).subscribe({
              next: (data) => {
                cache.set(id, data)
                subscriber.next(data)
              },
              complete: () => subscriber.complete(),
              error: err => subscriber.error(err),
            })
          }
        })
      }

      // 测试缓存
      await getCachedData('1').toPromise()
      await getCachedData('1').toPromise() // 应该使用缓存

      expect(apiCallCount).toBe(1)
      expect(cache.get('1')).toBe('data-1')
    })
  })

  describe('状态管理', () => {
    interface State {
      count: number
      data: string[]
    }

    it('使用 BehaviorSubject 管理状态', () => {
      const initialState: State = { count: 0, data: [] }
      const state$ = new BehaviorSubject<State>(initialState)
      const states: State[] = []

      // 订阅状态变化
      state$.subscribe(state => states.push(state))

      // 更新状态
      state$.next({ ...state$.getValue(), count: 1 })
      state$.next({
        ...state$.getValue(),
        data: ['item 1'],
      })

      expect(states).toEqual([
        { count: 0, data: [] },
        { count: 1, data: [] },
        { count: 1, data: ['item 1'] },
      ])
    })

    it('使用 scan 累积状态', () => {
      interface Action {
        type: 'INCREMENT' | 'ADD_DATA'
        payload?: any
      }

      const actions$ = new Subject<Action>()
      const states: State[] = []
      const initialState: State = { count: 0, data: [] }

      // 实现状态累积
      actions$.pipe(
        scan((state: State, action: Action) => {
          switch (action.type) {
            case 'INCREMENT':
              return { ...state, count: state.count + 1 }
            case 'ADD_DATA':
              return {
                ...state,
                data: [...state.data, action.payload],
              }
            default:
              return state
          }
        }, initialState),
      ).subscribe(state => states.push(state))

      // 分发 action
      actions$.next({ type: 'INCREMENT' })
      actions$.next({ type: 'ADD_DATA', payload: 'item 1' })

      expect(states).toEqual([
        { count: 1, data: [] },
        { count: 1, data: ['item 1'] },
      ])
    })
  })

  describe('性能优化', () => {
    it('资源清理', async () => {
      const values: number[] = []
      const destroy$ = new Subject<void>()

      // 创建长期运行的 Observable
      const source$ = interval(100).pipe(
        takeUntil(destroy$), // 使用 takeUntil 进行清理
        tap({
          complete: () => values.push(-1), // 标记完成
        }),
      )

      source$.subscribe(value => values.push(value))

      await vi.advanceTimersByTimeAsync(250)
      destroy$.next() // 触发清理
      await vi.advanceTimersByTimeAsync(100)

      expect(values).toEqual([0, 1, -1])
    })

    it('共享订阅', async () => {
      let subscribeCount = 0
      const values1: number[] = []
      const values2: number[] = []

      // 创建可能代价较高的 Observable
      const source$ = new Observable<number>((subscriber) => {
        subscribeCount++
        subscriber.next(1)
        subscriber.next(2)
        subscriber.complete()
      }).pipe(
        shareReplay(1), // 共享最后一个值
      )

      // 多个订阅者
      source$.subscribe(value => values1.push(value))
      source$.subscribe(value => values2.push(value))

      expect(subscribeCount).toBe(1) // 只订阅了一次
      expect(values1).toEqual([1, 2])
      expect(values2).toEqual([2])
    })
  })

  describe('常见模式', () => {
    it('发布订阅模式', () => {
      interface Message {
        channel: string
        data: any
      }

      class EventBus {
        private channels$ = new Subject<Message>()

        publish(channel: string, data: any) {
          this.channels$.next({ channel, data })
        }

        subscribe(channel: string) {
          return this.channels$.pipe(
            filter(msg => msg.channel === channel),
            map(msg => msg.data),
          )
        }
      }

      const eventBus = new EventBus()
      const values: any[] = []

      // 订阅特定频道
      eventBus.subscribe('test').subscribe(data => values.push(data))

      // 发布消息
      eventBus.publish('test', 1)
      eventBus.publish('other', 2) // 应该被过滤
      eventBus.publish('test', 3)

      expect(values).toEqual([1, 3])
    })

    it('命令查询分离', async () => {
      interface Command {
        type: 'ADD' | 'REMOVE'
        id: number
      }

      interface Query {
        type: 'GET_ALL' | 'GET_BY_ID'
        id?: number
      }

      class Store {
        private data = new Map<number, string>()
        private commands$ = new Subject<Command>()
        private queries$ = new Subject<Query>()

        constructor() {
          // 处理命令
          this.commands$.subscribe((cmd) => {
            switch (cmd.type) {
              case 'ADD':
                this.data.set(cmd.id, `item-${cmd.id}`)
                break
              case 'REMOVE':
                this.data.delete(cmd.id)
                break
            }
          })
        }

        // 命令接口
        execute(command: Command) {
          this.commands$.next(command)
        }

        // 查询接口
        query(query: Query) {
          switch (query.type) {
            case 'GET_ALL':
              return of(Array.from(this.data.values()))
            case 'GET_BY_ID':
              return of(this.data.get(query.id!))
            default:
              return of(null)
          }
        }
      }

      const store = new Store()
      const values: any[] = []

      // 执行命令
      store.execute({ type: 'ADD', id: 1 })
      store.execute({ type: 'ADD', id: 2 })

      // 查询结果
      await store.query({ type: 'GET_ALL' })
        .toPromise()
        .then(data => values.push(data))

      store.execute({ type: 'REMOVE', id: 1 })

      await store.query({ type: 'GET_ALL' })
        .toPromise()
        .then(data => values.push(data))

      expect(values).toEqual([
        ['item-1', 'item-2'],
        ['item-2'],
      ])
    })
  })
})
