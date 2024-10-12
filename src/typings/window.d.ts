declare global {
  interface Window {
    webkitOfflineAudioContext: typeof OfflineAudioContext
  }
}

export {}
