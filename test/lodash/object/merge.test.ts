import { merge } from 'lodash-es'
import { describe, expect, it } from 'vitest'

// merge
describe('merge', () => {
  // merge array
  it('merge array', () => {
    // merge 不是 unique concat
    // 所以不是简单的合并，而是合并后的数组是按照参数的顺序排列的
    expect(merge([1, 3, 2], [3, 4])).toEqual([3, 4, 2])
  })

  // merge object
  it('merge object', () => {
    // 合并对象，后面的属性会覆盖前面的属性
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })

    // 带数组的对象合并
    expect(merge({ a: [1] }, { a: [2] })).toEqual({ a: [2] })

    const object1 = {
      name: 'Alice',
      hobbies: ['reading', 'swimming'],
      skills: ['JavaScript'],
    }

    const object2 = {
      name: 'Bob',
      hobbies: ['cycling'],
      skills: ['Python', 'C++'],
    }

    const result = merge(object1, object2)
    expect(result).toEqual({
      name: 'Bob',
      hobbies: ['cycling', 'swimming'],
      skills: ['Python', 'C++'],
    })
  })
})
