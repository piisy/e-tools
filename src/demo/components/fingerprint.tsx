import { audioFingerprint, canvasFingerprint, webglFingerprint } from '@/fingerprint'
import { createResource, Suspense } from 'solid-js'

export function Fingerprint() {
  const [audioFp] = createResource(audioFingerprint)
  const [canvasFp] = createResource({}, canvasFingerprint)
  const [webglFp] = createResource(webglFingerprint)
  return (
    <Suspense fallback="Loading...">
      <h1>Audio Fingerprint</h1>
      <p>{audioFp()?.hash}</p>
      <h1>Canvas Fingerprint</h1>
      <p>{canvasFp()?.hash}</p>
      <h1>WebGL Fingerprint</h1>
      <p>{webglFp()?.hash}</p>
    </Suspense>
  )
}
