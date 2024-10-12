import { chain } from 'lodash-es'

describe('chain', () => {
  it('应该能够链式调用多个方法', () => {
    // 该方法应该是惰性的，只有调用 value 方法时才会执行
    const result = chain([1, 2, 3, 4])
      .map(n => n * 2)
      .filter(n => n > 4)
      .value()

    expect(result).toEqual([6, 8])
  })

  it('应该能够处理对象', () => {
    const users = [
      { user: 'barney', age: 36 },
      { user: 'fred', age: 40 },
      { user: 'pebbles', age: 1 },
    ]

    const youngest = chain(users)
      .sortBy('age')
      .map(user => `${user.user} is ${user.age}`)
      .head()
      .value()

    expect(youngest).toBe('pebbles is 1')
  })

  it('应该能够与其他 lodash 方法结合使用', () => {
    const numbers = [1, 2, 3, 4, 5]

    const result = chain(numbers)
      .tap((array) => {
        array.pop()
      })
      .reverse()
      .value()

    expect(result).toEqual([4, 3, 2, 1])
  })
})

describe('chain 方法的惰性求值测试', () => {
  it('应该在调用 value() 之前不执行链式方法', () => {
    const arr = [1, 2, 3, 4]
    const tapFn = vi.fn()

    const chained = chain(arr)
      .map(n => n * 2)
      .filter(n => n > 4)
      .tap(tapFn)

    expect(tapFn).not.toHaveBeenCalled()
    const result = chained.value()
    expect(tapFn).toHaveBeenCalled()

    expect(result).toEqual([6, 8])
  })
})
