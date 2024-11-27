import { concurrent } from '@/promise/concurrent'
import { waitFor } from '@/promise/wait'
import { describe, expect, it, vi } from 'vitest'

describe('concurrent function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('限制最大并发数', async () => {
    const tasks = [
      async () => {
        await waitFor(300)
        return 1
      },
      async () => {
        await waitFor(100)
        return 2
      },
      async () => {
        await waitFor(200)
        return 3
      },
    ]

    const preserveOrder = concurrent(tasks)
    const nonPreserveOrder = concurrent(tasks, {
      maxConcurrent: 2,
      preserveOrder: false,
    })
    await vi.runAllTimersAsync()
    const preserveOrderResults = await preserveOrder
    const nonPreserveOrderResults = await nonPreserveOrder

    // 验证执行顺序是按照完成时间排序的
    expect(preserveOrderResults).toEqual([1, 2, 3])
    expect(nonPreserveOrderResults).toEqual([2, 3, 1])
  })

  it('应该处理任务中的错误', async () => {
    const tasks = [
      async () => {
        await waitFor(100)
        return 1
      },
      async () => {
        await waitFor(50)
        throw new Error('Task failed')
      },
      async () => {
        await waitFor(150)
        return 3
      },
    ]

    const fastFailPromise = concurrent(tasks)
    // const nonFastFailPromise = concurrent(tasks, {
    //   fastFail: false,
    // })
    await vi.runAllTimersAsync()
    await expect(fastFailPromise).rejects.toThrow('Task failed')
    // await expect(nonFastFailPromise).resolves.toEqual([
    //   1,
    //   expect.objectContaining({
    //     message: 'Task failed',
    //   }),
    //   3,
    // ])
  })

  it('应该处理空任务数组', async () => {
    const results = await concurrent([])
    expect(results).toEqual([])
  })
})
