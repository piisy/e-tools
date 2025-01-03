export function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function atLeast(
  promise: Promise<unknown>,
  ms: number,
) {
  const result = await Promise.allSettled([
    waitFor(ms),
    promise,
  ])

  return result[1]
}
