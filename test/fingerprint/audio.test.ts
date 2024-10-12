import { audioFingerprint } from '@/fingerprint'

describe('audio fingerprint', () => {
  it('audioFingerprint', async () => {
    // expect error
    await expect(audioFingerprint()).rejects.toThrowError('Audio fingerprinting is not supported in this environment')
  })
})
