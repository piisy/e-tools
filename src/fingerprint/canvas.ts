import md5 from 'crypto-js/md5'

interface Options {
  dontUseFakeFontInCanvas?: boolean
}

interface Result {
  canvasWinding?: string
  rawData?: string
  hash?: string
}

export async function canvasFingerprint(options: Options = {}) {
  const result: Result = {}
  const canvas = document.createElement('canvas')
  canvas.width = 2000
  canvas.height = 200
  canvas.style.display = 'inline'
  const ctx = canvas.getContext('2d')

  if (ctx === null) {
    throw new Error('Canvas fingerprinting is not supported in this environment')
  }

  // 检测浏览器支持的画布缠绕规则
  ctx.rect(0, 0, 10, 10)
  ctx.rect(2, 2, 6, 6)
  result.canvasWinding = !ctx.isPointInPath(5, 5, 'evenodd') ? 'yes' : 'no'

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.font = options.dontUseFakeFontInCanvas ? '11pt Arial' : '11pt no-real-font-123'
  ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 15)

  ctx.fillStyle = 'rgba(102, 204, 0, 0.2)'
  ctx.font = '18pt Arial'
  ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 4, 45)

  // 画布混合模式
  ctx.globalCompositeOperation = 'multiply';
  ['rgb(255,0,255)', 'rgb(0,255,255)', 'rgb(255,255,0)'].forEach((color, index) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(50 + index * 50, 50, 50, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
  })

  ctx.fillStyle = 'rgb(255,0,255)'
  ctx.arc(75, 75, 75, 0, Math.PI * 2, true)
  ctx.arc(75, 75, 25, 0, Math.PI * 2, true)
  ctx.fill('evenodd')

  if (canvas.toDataURL) {
    result.rawData = canvas.toDataURL()
    result.hash = md5(result.rawData).toString()
  }

  return result
}
