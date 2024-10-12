import { isEqual } from 'lodash-es'
import array from 'lodash-es/array'
import { expect } from 'vitest'

describe('lodash array', () => {
  it('列出所有方法', () => {
    expect(Object.keys(array))
      .toEqual([
        'chunk',
        'compact',
        'concat',
        'difference',
        'differenceBy',
        'differenceWith',
        'drop',
        'dropRight',
        'dropRightWhile',
        'dropWhile',
        'fill',
        'findIndex',
        'findLastIndex',
        'first',
        'flatten',
        'flattenDeep',
        'flattenDepth',
        'fromPairs',
        'head',
        'indexOf',
        'initial',
        'intersection',
        'intersectionBy',
        'intersectionWith',
        'join',
        'last',
        'lastIndexOf',
        'nth',
        'pull',
        'pullAll',
        'pullAllBy',
        'pullAllWith',
        'pullAt',
        'remove',
        'reverse',
        'slice',
        'sortedIndex',
        'sortedIndexBy',
        'sortedIndexOf',
        'sortedLastIndex',
        'sortedLastIndexBy',
        'sortedLastIndexOf',
        'sortedUniq',
        'sortedUniqBy',
        'tail',
        'take',
        'takeRight',
        'takeRightWhile',
        'takeWhile',
        'union',
        'unionBy',
        'unionWith',
        'uniq',
        'uniqBy',
        'uniqWith',
        'unzip',
        'unzipWith',
        'without',
        'xor',
        'xorBy',
        'xorWith',
        'zip',
        'zipObject',
        'zipObjectDeep',
        'zipWith',
      ])
  })

  it('chunk 方法', () => {
    expect(array.chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    expect(array.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(array.chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]])
    expect(array.chunk([], 2)).toEqual([])
  })

  it('compact 方法', () => {
    expect(array.compact([0, 1, false, 2, '', 3])).toEqual([1, 2, 3])
    expect(array.compact([null, undefined, Number.NaN, 0, '', false])).toEqual([])
    expect(array.compact([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('concat 方法', () => {
    expect(array.concat([], 1, [2, 3], 4)).toEqual([1, 2, 3, 4])
    expect(array.concat([1, 2], [3, 4])).toEqual([1, 2, 3, 4])
  })

  it('difference 方法', () => {
    expect(array.difference([2, 1], [2, 3])).toEqual([1])
    expect(array.difference([1, 2, 3, 4, 5], [5, 2, 10])).toEqual([1, 3, 4])
    expect(array.difference([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3])
  })

  it('differenceBy 方法', () => {
    expect(array.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([1.2])
    expect(array.differenceBy([{ x: 2 }, { x: 1 }], [{ x: 1 }], 'x')).toEqual([{ x: 2 }])
    expect(array.differenceBy([1.2, 2.3, 3.4], [2.5, 3.6], Math.floor)).toEqual([1.2])
  })

  it('differenceWith 方法', () => {
    const objects = [{ x: 1, y: 2 }, { x: 2, y: 1 }]
    expect(array.differenceWith(objects, [{ x: 1, y: 2 }], isEqual)).toEqual([{ x: 2, y: 1 }])
    expect(array.differenceWith([{ x: 1, y: 2 }, { x: 2, y: 1 }], [{ x: 1, y: 2 }], isEqual)).toEqual([{ x: 2, y: 1 }])
    expect(array.differenceWith([1, 2, 3], [4, 5, 6], isEqual)).toEqual([1, 2, 3])
  })

  it('drop 方法', () => {
    expect(array.drop([1, 2, 3])).toEqual([2, 3])
    expect(array.drop([1, 2, 3], 2)).toEqual([3])
    expect(array.drop([1, 2, 3], 5)).toEqual([])
    expect(array.drop([1, 2, 3], 0)).toEqual([1, 2, 3])
  })

  it('dropRight 方法', () => {
    expect(array.dropRight([1, 2, 3])).toEqual([1, 2])
    expect(array.dropRight([1, 2, 3], 2)).toEqual([1])
    expect(array.dropRight([1, 2, 3], 5)).toEqual([])
    expect(array.dropRight([1, 2, 3], 0)).toEqual([1, 2, 3])
  })

  it('dropRightWhile 方法', () => {
    const users = [
      { user: 'barney', active: true },
      { user: 'fred', active: false },
      { user: 'pebbles', active: false },
    ]
    expect(array.dropRightWhile(users, (o) => {
      return !o.active
    })).toEqual([{ user: 'barney', active: true }])
    expect(array.dropRightWhile(users, { user: 'pebbles', active: false })).toEqual([{
      user: 'barney',
      active: true,
    }, { user: 'fred', active: false }])
    expect(array.dropRightWhile(users, ['active', false])).toEqual([{ user: 'barney', active: true }])
    expect(array.dropRightWhile(users, 'active')).toEqual(users)
  })

  it('dropWhile 方法', () => {
    const users = [
      { user: 'barney', active: false },
      { user: 'fred', active: false },
      { user: 'pebbles', active: true },
    ]
    expect(array.dropWhile(users, (o) => {
      return !o.active
    })).toEqual([{ user: 'pebbles', active: true }])
    expect(array.dropWhile(users, { user: 'barney', active: false })).toEqual([{
      user: 'fred',
      active: false,
    }, { user: 'pebbles', active: true }])
    expect(array.dropWhile(users, ['active', false])).toEqual([{ user: 'pebbles', active: true }])
    expect(array.dropWhile(users, 'active')).toEqual(users)
  })

  it('fill 方法', () => {
    const arr = [1, 2, 3]
    expect(array.fill(arr, 'a')).toEqual(['a', 'a', 'a'])
    expect(array.fill(Array.from({ length: 3 }), 2)).toEqual([2, 2, 2])
    expect(array.fill([4, 6, 8, 10], '*', 1, 3)).toEqual([4, '*', '*', 10])
    expect(array.fill([1, 2, 3, 4], 'x', -2)).toEqual([1, 2, 'x', 'x'])
  })

  it('findIndex 方法', () => {
    const users = [
      { user: 'barney', active: false },
      { user: 'fred', active: false },
      { user: 'pebbles', active: true },
    ]
    expect(array.findIndex(users, (o) => {
      return o.user === 'barney'
    })).toBe(0)
    expect(array.findIndex(users, { user: 'fred', active: false })).toBe(1)
    expect(array.findIndex(users, ['active', false])).toBe(0)
    expect(array.findIndex(users, 'active')).toBe(2)
    expect(array.findIndex(users, o => o.user === 'wilma')).toBe(-1)
  })

  it('findLastIndex 方法', () => {
    const users = [
      { user: 'barney', active: true },
      { user: 'fred', active: false },
      { user: 'pebbles', active: false },
    ]
    expect(array.findLastIndex(users, (o) => {
      return o.user === 'pebbles'
    })).toBe(2)
    expect(array.findLastIndex(users, { user: 'barney', active: true })).toBe(0)
    expect(array.findLastIndex(users, ['active', false])).toBe(2)
    expect(array.findLastIndex(users, 'active')).toBe(0)
    expect(array.findLastIndex(users, o => o.user === 'wilma')).toBe(-1)
  })

  it('first 方法', () => {
    expect(array.first([1, 2, 3])).toBe(1)
    expect(array.first([])).toBe(undefined)
  })

  it('flatten 方法', () => {
    expect(array.flatten([1, [2, [3, [4]], 5]])).toEqual([1, 2, [3, [4]], 5])
    expect(array.flatten([1, 2, [3, 4]])).toEqual([1, 2, 3, 4])
    expect(array.flatten([])).toEqual([])
  })

  it('flattenDeep 方法', () => {
    expect(array.flattenDeep([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5])
    expect(array.flattenDeep([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5])
    expect(array.flattenDeep([])).toEqual([])
  })

  it('flattenDepth 方法', () => {
    const arr = [1, [2, [3, [4]], 5]]
    expect(array.flattenDepth(arr, 1)).toEqual([1, 2, [3, [4]], 5])
    expect(array.flattenDepth(arr, 2)).toEqual([1, 2, 3, [4], 5])
    expect(array.flattenDepth(arr, Infinity)).toEqual([1, 2, 3, 4, 5])
    expect(array.flattenDepth(arr, 0)).toEqual([1, [2, [3, [4]], 5]])
  })

  it('fromPairs 方法', () => {
    expect(array.fromPairs([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 })
    expect(array.fromPairs([['x', 1], ['y', 2], ['z', 3]])).toEqual({ x: 1, y: 2, z: 3 })
    expect(array.fromPairs([])).toEqual({})
  })

  it('head 方法', () => {
    expect(array.head([1, 2, 3])).toBe(1)
    expect(array.head([])).toBe(undefined)
    expect(array.head([null, 0, false])).toBe(null)
  })

  it('indexOf 方法', () => {
    expect(array.indexOf([1, 2, 1, 2], 2)).toBe(1)
    expect(array.indexOf([1, 2, 1, 2], 2, 2)).toBe(3)
    expect(array.indexOf([1, 2, 3], 4)).toBe(-1)
    expect(array.indexOf([1, 2, 3, 4, 5], 2, -2)).toBe(-1)
  })

  it('initial 方法', () => {
    expect(array.initial([1, 2, 3])).toEqual([1, 2])
    expect(array.initial([1])).toEqual([])
    expect(array.initial([])).toEqual([])
  })

  it('intersection 方法', () => {
    expect(array.intersection([2, 1], [2, 3])).toEqual([2])
    expect(array.intersection([1, 2], [4, 2], [2, 1])).toEqual([2])
    expect(array.intersection([1, 2, 3], [4, 5, 6])).toEqual([])
  })

  it('intersectionBy 方法', () => {
    expect(array.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([2.1])
    expect(array.intersectionBy([{ x: 1 }], [{ x: 2 }, { x: 1 }], 'x')).toEqual([{ x: 1 }])
    expect(array.intersectionBy([1.2, 2.4], [2.5, 3.6], Math.floor)).toEqual([
      2.4,
    ])
  })

  it('intersectionWith 方法', () => {
    const objects = [{ x: 1, y: 2 }, { x: 2, y: 1 }]
    const others = [{ x: 1, y: 1 }, { x: 1, y: 2 }]
    expect(array.intersectionWith(objects, others, isEqual)).toEqual([{ x: 1, y: 2 }])
    expect(array.intersectionWith([{ x: 1, y: 2 }, { x: 2, y: 1 }], [{ x: 1, y: 1 }], isEqual)).toEqual([])
    expect(array.intersectionWith([2, 1], [2, 3])).toEqual([2])
  })

  it('join 方法', () => {
    expect(array.join(['a', 'b', 'c'], '~')).toBe('a~b~c')
    expect(array.join([1, 2, 3], ', ')).toBe('1, 2, 3')
    expect(array.join([], '-')).toBe('')
  })

  it('last 方法', () => {
    expect(array.last([1, 2, 3])).toBe(3)
    expect(array.last([])).toBe(undefined)
  })

  it('lastIndexOf', () => {
    expect(array.lastIndexOf([1, 2, 1, 2], 2)).toBe(3)
    expect(array.lastIndexOf([1, 2, 1, 2], 2, 2)).toBe(1)
  })

  it('nth', () => {
    const arr = ['a', 'b', 'c', 'd']
    expect(array.nth(arr, 1)).toBe('b')
    expect(array.nth(arr, -2)).toBe('c')
  })

  it('pull', () => {
    const arr = ['a', 'b', 'c', 'a', 'b', 'c']
    array.pull(arr, 'a', 'c')
    expect(arr).toEqual(['b', 'b'])
  })

  it('pullAll', () => {
    const arr = ['a', 'b', 'c', 'a', 'b', 'c']
    array.pullAll(arr, ['a', 'c'])
    expect(arr).toEqual(['b', 'b'])
  })

  it('pullAllBy', () => {
    const arr = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 1 }]
    array.pullAllBy(arr, [{ x: 1 }, { x: 3 }], 'x')
    expect(arr).toEqual([{ x: 2 }])
  })

  it('pullAllWith', () => {
    const arr = [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }]
    array.pullAllWith(arr, [{ x: 3, y: 4 }], isEqual)
    expect(arr).toEqual([{ x: 1, y: 2 }, { x: 5, y: 6 }])
  })

  it('pullAt', () => {
    const arr = ['a', 'b', 'c', 'd']
    const pulled = array.pullAt(arr, [1, 3])
    expect(arr).toEqual(['a', 'c'])
    expect(pulled).toEqual(['b', 'd'])
  })

  it('remove', () => {
    const arr = [1, 2, 3, 4]
    const evens = array.remove(arr, (n) => {
      return n % 2 === 0
    })
    expect(arr).toEqual([1, 3])
    expect(evens).toEqual([2, 4])
  })

  it('reverse', () => {
    const arr = [1, 2, 3]
    array.reverse(arr)
    expect(arr).toEqual([3, 2, 1])
  })

  it('slice', () => {
    const arr = [1, 2, 3, 4]
    expect(array.slice(arr, 2)).toEqual([3, 4])
    expect(array.slice(arr, 1, 3)).toEqual([2, 3])
  })

  it('sortedIndex', () => {
    expect(array.sortedIndex([30, 50], 40)).toBe(1)
  })

  it('sortedIndexBy', () => {
    const objects = [{ x: 4 }, { x: 5 }]
    expect(array.sortedIndexBy(objects, { x: 4 }, (o) => {
      return o.x
    })).toBe(0)
    expect(array.sortedIndexBy(objects, { x: 4 }, 'x')).toBe(0)
  })

  it('sortedIndexOf', () => {
    expect(array.sortedIndexOf([4, 5, 5, 5, 6], 5)).toBe(1)
  })

  it('sortedLastIndex', () => {
    expect(array.sortedLastIndex([4, 5, 5, 5, 6], 5)).toBe(4)
  })

  it('sortedLastIndexBy', () => {
    const objects = [{ x: 4 }, { x: 5 }]
    expect(array.sortedLastIndexBy(objects, { x: 4 }, (o) => {
      return o.x
    })).toBe(1)
    expect(array.sortedLastIndexBy(objects, { x: 4 }, 'x')).toBe(1)
  })

  it('sortedLastIndexOf', () => {
    expect(array.sortedLastIndexOf([4, 5, 5, 5, 6], 5)).toBe(3)
  })

  it('sortedUniq', () => {
    expect(array.sortedUniq([1, 1, 2])).toEqual([1, 2])
  })

  it('sortedUniqBy', () => {
    expect(array.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor)).toEqual([1.1, 2.3])
  })

  it('tail', () => {
    expect(array.tail([1, 2, 3])).toEqual([2, 3])
  })

  it('take', () => {
    expect(array.take([1, 2, 3])).toEqual([1])
    expect(array.take([1, 2, 3], 2)).toEqual([1, 2])
    expect(array.take([1, 2, 3], 5)).toEqual([1, 2, 3])
    expect(array.take([1, 2, 3], 0)).toEqual([])
  })

  it('takeRight', () => {
    expect(array.takeRight([1, 2, 3])).toEqual([3])
    expect(array.takeRight([1, 2, 3], 2)).toEqual([2, 3])
    expect(array.takeRight([1, 2, 3], 5)).toEqual([1, 2, 3])
    expect(array.takeRight([1, 2, 3], 0)).toEqual([])
  })

  it('takeRightWhile', () => {
    const users = [
      { user: 'barney', active: true },
      { user: 'fred', active: false },
      { user: 'pebbles', active: false },
    ]
    expect(array.takeRightWhile(users, (o) => {
      return !o.active
    }))
      .toEqual([{ user: 'fred', active: false }, { user: 'pebbles', active: false }])
  })

  it('takeWhile', () => {
    const users = [
      { user: 'barney', active: false },
      { user: 'fred', active: false },
      { user: 'pebbles', active: true },
    ]
    expect(array.takeWhile(users, (o) => {
      return !o.active
    }))
      .toEqual([{ user: 'barney', active: false }, { user: 'fred', active: false }])
  })

  it('union', () => {
    expect(array.union([2], [1, 2])).toEqual([2, 1])
  })

  it('unionBy', () => {
    expect(array.unionBy([2.1], [1.2, 2.3], Math.floor)).toEqual([2.1, 1.2])
  })

  it('unionWith', () => {
    const objects = [{ x: 1, y: 2 }, { x: 2, y: 1 }]
    const others = [{ x: 1, y: 1 }, { x: 1, y: 2 }]
    expect(array.unionWith(objects, others, isEqual)).toEqual([{ x: 1, y: 2 }, { x: 2, y: 1 }, { x: 1, y: 1 }])
  })

  it('uniq 方法', () => {
    expect(array.uniq([2, 1, 2])).toEqual([2, 1])
    expect(array.uniq([1, 2, 1, 3, 1])).toEqual([1, 2, 3])
  })

  it('uniqBy 方法', () => {
    expect(array.uniqBy([2.1, 1.2, 2.3], Math.floor)).toEqual([2.1, 1.2])
    expect(array.uniqBy([{ x: 1 }, { x: 2 }, { x: 1 }], 'x')).toEqual([{ x: 1 }, { x: 2 }])
  })

  it('uniqWith 方法', () => {
    const objects = [{ x: 1, y: 2 }, { x: 2, y: 1 }, { x: 1, y: 2 }]
    expect(array.uniqWith(objects, isEqual)).toEqual([{ x: 1, y: 2 }, { x: 2, y: 1 }])
  })

  it('unzip 方法', () => {
    expect(array.unzip([['a', 1, true], ['b', 2, false]])).toEqual([['a', 'b'], [1, 2], [true, false]])
    expect(array.unzip([['a', 1], ['b', 2], ['c', 3]])).toEqual([['a', 'b', 'c'], [1, 2, 3]])
  })

  it('unzipWith 方法', () => {
    const zipped = [[1, 10, 100], [2, 20, 200]]
    expect(array.unzipWith(zipped, (a, b) => a + b)).toEqual([3, 30, 300])
  })

  it('without 方法', () => {
    expect(array.without([2, 1, 2, 3], 1, 2)).toEqual([3])
    expect(array.without([1, 2, 3, 4], 2, 3)).toEqual([1, 4])
  })

  it('xor 方法', () => {
    expect(array.xor([2, 1], [2, 3])).toEqual([1, 3])
    expect(array.xor([1, 2, 3], [4, 2], [2, 1])).toEqual([3, 4])
  })

  it('xorBy 方法', () => {
    expect(array.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([1.2, 3.4])
    expect(array.xorBy([{ x: 1 }], [{ x: 2 }, { x: 1 }], 'x')).toEqual([{ x: 2 }])
  })

  it('xorWith 方法', () => {
    const objects = [{ x: 1, y: 2 }, { x: 2, y: 1 }]
    const others = [{ x: 1, y: 1 }, { x: 1, y: 2 }]
    expect(array.xorWith(objects, others, isEqual)).toEqual([{ x: 2, y: 1 }, { x: 1, y: 1 }])
  })

  it('zip 方法', () => {
    expect(array.zip(['a', 'b'], [1, 2], [true, false])).toEqual([['a', 1, true], ['b', 2, false]])
    expect(array.zip([1, 2], [10, 20], [100, 200])).toEqual([[1, 10, 100], [2, 20, 200]])
  })

  it('zipObject 方法', () => {
    expect(array.zipObject(['a', 'b'], [1, 2])).toEqual({ a: 1, b: 2 })
    expect(array.zipObject(['x', 'y'], [10, 20])).toEqual({ x: 10, y: 20 })
  })

  it('zipObjectDeep 方法', () => {
    expect(array.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2])).toEqual({ a: { b: [{ c: 1 }, { d: 2 }] } })
  })

  it('zipWith 方法', () => {
    expect(array.zipWith([1, 2], [10, 20], [100, 200], (a, b, c) => a + b + c)).toEqual([111, 222])
  })
})
