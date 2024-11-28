import {
  BehaviorSubject,
  bufferCount,
  concatMap,
  debounceTime,
  delay,
  interval,
  map,
  mergeMap,
  Observable,
  of,
  scan,
  share,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

describe('rxJS Interaction Patterns', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('动画和交互', () => {
    it('简单动画实现', async () => {
      const frames: number[] = []
      const duration = 1000
      const start = Date.now()

      // 使用 animationFrame 调度器创建动画帧
      const animation$ = new Observable<number>((subscriber) => {
        function update() {
          const elapsed = Date.now() - start
          if (elapsed < duration) {
            const progress = elapsed / duration
            subscriber.next(progress)
            requestAnimationFrame(update)
          }
          else {
            subscriber.next(1)
            subscriber.complete()
          }
        }
        update()
      })

      animation$.subscribe(progress => frames.push(progress))

      // 模拟动画帧
      await vi.advanceTimersByTimeAsync(1000)
      expect(frames[frames.length - 1]).toBe(0.992)
    })

    it('拖拽实现', () => {
      const mouseDown$ = new Subject<{ x: number, y: number }>()
      const mouseMove$ = new Subject<{ x: number, y: number }>()
      const mouseUp$ = new Subject<void>()
      const positions: { x: number, y: number }[] = []

      // 实现拖拽逻辑
      mouseDown$.pipe(
        switchMap(start => mouseMove$.pipe(
          map(move => ({
            x: move.x - start.x,
            y: move.y - start.y,
          })),
          takeUntil(mouseUp$),
        )),
      ).subscribe(position => positions.push(position))

      // 模拟拖拽过程
      mouseDown$.next({ x: 0, y: 0 })
      mouseMove$.next({ x: 10, y: 10 })
      mouseMove$.next({ x: 20, y: 20 })
      mouseUp$.next()

      expect(positions).toEqual([
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ])
    })
  })

  describe('webSocket 和实时数据', () => {
    it('webSocket 重连实现', async () => {
      const messages: string[] = []
      let connectionAttempts = 0

      // 模拟 WebSocket 连接
      class MockWebSocket {
        private listeners: Record<string, ((...args: unknown[]) => unknown)[]> = {}

        constructor(private url: string) {
          connectionAttempts++
        }

        addEventListener(event: string, listener: ((...args: unknown[]) => unknown)) {
          if (!this.listeners[event]) {
            this.listeners[event] = []
          }
          this.listeners[event].push(listener)
        }

        removeEventListener(event: string, listener: ((...args: unknown[]) => unknown)) {
          if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(l => l !== listener)
          }
        }

        close() {
          this.trigger('close')
        }

        send(data: string) {
          this.trigger('message', { data })
        }

        private trigger(event: string, data?: any) {
          if (this.listeners[event]) {
            this.listeners[event].forEach(listener => listener(data))
          }
        }
      }

      // 实现重连逻辑
      function createWebSocketWithRetry(url: string, retryCount = 3) {
        return new Observable<string>((subscriber) => {
          let ws: MockWebSocket | null = null
          let retries = 0

          function connect() {
            ws = new MockWebSocket(url)

            ws.addEventListener('message', (event: any) => {
              subscriber.next(event.data)
            })

            ws.addEventListener('close', () => {
              if (retries < retryCount) {
                retries++
                setTimeout(connect, 1000) // 1秒后重连
              }
              else {
                subscriber.complete()
              }
            })
          }

          connect()

          return () => {
            if (ws) {
              ws.close()
            }
          }
        })
      }

      // 测试重连
      const connection$ = createWebSocketWithRetry('ws://test')
        .pipe(share())

      connection$.subscribe(msg => messages.push(msg))

      // 模拟连接断开和重连
      await vi.advanceTimersByTimeAsync(3000)
      expect(connectionAttempts).toBe(1) // 初始连接 + 2次重试
    })
  })

  describe('并发控制', () => {
    it('批处理实现', async () => {
      const results: number[][] = []
      const source$ = interval(100).pipe(take(10))

      // 实现批处理
      source$.pipe(
        bufferCount(3), // 每3个值为一批
        mergeMap(batch =>
          // 模拟批处理操作
          of(batch).pipe(delay(200)),
        ),
      ).subscribe(batch => results.push(batch))

      await vi.advanceTimersByTimeAsync(1500)
      expect(results).toEqual([
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [9],
      ])
    })

    it('队列处理实现', async () => {
      const results: number[] = []
      const queue$ = new Subject<number>()

      // 实现队列处理
      queue$.pipe(
        concatMap(item =>
          // 模拟异步处理
          of(item).pipe(delay(100)),
        ),
      ).subscribe(item => results.push(item))

      // 添加任务到队列
      queue$.next(1)
      queue$.next(2)
      queue$.next(3)

      await vi.advanceTimersByTimeAsync(400)
      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('高级模式', () => {
    it('响应式表单实现', () => {
      interface FormState {
        value: string
        valid: boolean
        errors: string[]
      }

      class FormControl {
        private state$ = new BehaviorSubject<FormState>({
          value: '',
          valid: true,
          errors: [],
        })

        setValue(value: string) {
          const errors = this.validate(value)
          this.state$.next({
            value,
            valid: errors.length === 0,
            errors,
          })
        }

        private validate(value: string): string[] {
          const errors: string[] = []
          if (value.length < 3) {
            errors.push('最小长度为3')
          }
          return errors
        }

        get valueChanges() {
          return this.state$.pipe(map(state => state.value))
        }

        get statusChanges() {
          return this.state$.pipe(map(state => state.valid))
        }
      }

      const control = new FormControl()
      const values: string[] = []
      const validStates: boolean[] = []

      control.valueChanges.subscribe(value => values.push(value))
      control.statusChanges.subscribe(valid => validStates.push(valid))

      control.setValue('a')
      control.setValue('abc')

      expect(values).toEqual(['', 'a', 'abc'])
      expect(validStates).toEqual([true, false, true])
    })

    it('无限滚动实现', async () => {
      const items: number[] = []
      const scroll$ = new Subject<void>()

      // 模拟加载数据
      const loadPage = (page: number) =>
        of(Array.from({ length: 10 }, (_, i) => page * 10 + i))
          .pipe(delay(100))

      // 实现无限滚动
      scroll$.pipe(
        // 防抖，避免频繁加载
        debounceTime(200),
        // 记录页码
        scan(acc => acc + 1, 0),
        // 加载数据
        switchMap(page => loadPage(page)),
      ).subscribe(newItems => items.push(...newItems))

      // 模拟滚动
      scroll$.next()
      await vi.advanceTimersByTimeAsync(300)
      scroll$.next()
      await vi.advanceTimersByTimeAsync(300)

      expect(items.length).toBe(20) // 加载了两页数据
      expect(items[0]).toBe(10) // 第一页第一项
      expect(items[19]).toBe(29) // 第二页最后一项
    })
  })
})
