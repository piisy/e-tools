import md5 from 'crypto-js/md5'

export async function audioFingerprint() {
  const rawData = await new Promise((done, reject) => {
    const options = {
      audio: {
        timeout: 1000,
        // On iOS 11, audio context can only be used in response to user interaction.
        // We require users to explicitly enable audio fingerprinting on iOS 11.
        // See https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
        excludeIOS11: true,
      },
    }

    const audioOptions = options.audio
    if (audioOptions.excludeIOS11 && navigator.userAgent.match(/OS 11.+Version\/11.+Safari/)) {
      // See comment for excludeUserAgent and https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
      reject(new Error('Audio fingerprinting on iOS 11 is disabled, as it is not possible to extract a fingerprint from audio context.'))
    }

    const AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext

    if (!AudioContext) {
      reject(new Error('Audio fingerprinting is not supported in this environment'))
    }

    let context = new AudioContext(1, 44100, 44100)

    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, context.currentTime)

    const compressor = context.createDynamicsCompressor();

    [
      ['threshold', -50],
      ['knee', 40],
      ['ratio', 12],
      ['reduction', -20],
      ['attack', 0],
      ['release', 0.25],
    ].forEach((item) => {
      // @ts-expect-error
      if (compressor[item[0]] !== undefined && typeof compressor[item[0]].setValueAtTime === 'function') {
        // @ts-expect-error
        compressor[item[0]].setValueAtTime(item[1], context.currentTime)
      }
    })

    oscillator.connect(compressor)
    compressor.connect(context.destination)
    oscillator.start(0)
    context.startRendering()

    const audioTimeoutId = setTimeout(() => {
      console.warn(`Audio fingerprint timed out. Please report bug at https://github.com/Valve/fingerprintjs2 with your user agent: "${navigator.userAgent}".`)
      context.oncomplete = function () {
      }
      // @ts-expect-error
      context = null
      return done('audioTimeout')
    }, audioOptions.timeout)

    context.oncomplete = function (event) {
      let fingerprint
      try {
        clearTimeout(audioTimeoutId)
        fingerprint = event.renderedBuffer.getChannelData(0)
          .slice(4500, 5000)
          .reduce((acc, val) => {
            return acc + Math.abs(val)
          }, 0)
          .toString()
        oscillator.disconnect()
        compressor.disconnect()
      }
      catch (error) {
        done(error)
        return
      }
      done(fingerprint)
    }
  })
  return {
    hash: md5(`${rawData}`).toString(),
    rawData,
  }
}
