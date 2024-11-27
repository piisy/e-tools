import { from, map, mergeMap } from 'rxjs'

export interface ConcurrentOptions {
  /**
   * 最大并发数
   */
  maxConcurrent?: number
  /**
   * 是否保持输出顺序与输入顺序一致
   */
  preserveOrder?: boolean
  /**
   * 是否快速失败。如果为 true，则在任何任务失败时立即抛出错误。
   * 如果为 false，则等待所有任务完成后返回所有结果(包含成功和失败)
   */
  fastFail?: boolean
}

/**
 * 使用 RxJS 实现限制最大并发数的函数
 * @param tasks 待执行的任务数组
 * @param options 选项
 * @param options.maxConcurrent 最大并发数
 * @param options.preserveOrder 是否保持输出顺序与输入顺序一致,默认为 true
 * @param options.fastFail 是否快速失败,默认为 true
 * @returns Promise<T[]> 所有任务的执行结果
 */
export function concurrent<T>(
  tasks: (() => Promise<T>)[],
  options?: ConcurrentOptions,
): Promise<T[]> {
  const { maxConcurrent, preserveOrder = true, fastFail = true } = options || {}
  return new Promise((resolve, reject) => {
    const results: Array<{ status: 'fulfilled' | 'rejected', value?: T, reason?: any }> = []
    const indexMap = new Map<number, { status: 'fulfilled' | 'rejected', value?: T, reason?: any }>()
    let currentIndex = 0

    from(tasks).pipe(
      map((task, index) => ({ task: task(), index })),
      mergeMap(
        async ({ task, index }) => {
          try {
            const result = await task
            return { status: 'fulfilled' as const, value: result, index }
          }
          catch (error) {
            if (fastFail)
              throw error
            return { status: 'rejected' as const, reason: error, index }
          }
        },
        maxConcurrent,
      ),
    ).subscribe({
      next: (result) => {
        if (preserveOrder) {
          indexMap.set(result.index, result)
          while (indexMap.has(currentIndex)) {
            const current = indexMap.get(currentIndex)!
            results.push(current)
            indexMap.delete(currentIndex)
            currentIndex++
          }
        }
        else {
          results.push(result)
        }
      },
      error: error => reject(error),
      complete: () => {
        resolve(results.map(r => r.value || r.reason))
      },
    })
  })
}
