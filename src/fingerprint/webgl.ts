import md5 from 'crypto-js/md5'

function getWebglCanvas(): WebGLRenderingContext | null {
  const canvas = document.createElement('canvas')
  try {
    return (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext
  }
  catch {
    throw new Error('WebGL fingerprinting is not supported in this environment')
  }
}

export function webglFingerprint() {
  const gl = getWebglCanvas()
  if (!gl) {
    throw new Error('WebGL fingerprinting is not supported in this environment')
  }

  // Configure WebGL shaders and buffers
  const vertexPosBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
  const vertices = new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0])
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const program = gl.createProgram()!
  const vshader = gl.createShader(gl.VERTEX_SHADER)!
  gl.shaderSource(vshader, 'attribute vec2 attrVertex; varying vec2 varyinTexCoordinate; uniform vec2 uniformOffset; void main() { varyinTexCoordinate = attrVertex + uniformOffset; gl_Position = vec4(attrVertex, 0, 1); }')
  gl.compileShader(vshader)
  const fshader = gl.createShader(gl.FRAGMENT_SHADER)!
  gl.shaderSource(fshader, 'precision mediump float; varying vec2 varyinTexCoordinate; void main() { gl_FragColor = vec4(varyinTexCoordinate, 0, 1); }')
  gl.compileShader(fshader)
  gl.attachShader(program, vshader)
  gl.attachShader(program, fshader)
  gl.linkProgram(program)
  gl.useProgram(program)

  const vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex')
  gl.enableVertexAttribArray(vertexPosAttrib)
  gl.vertexAttribPointer(vertexPosAttrib, 3, gl.FLOAT, false, 0, 0)
  gl.uniform2f(gl.getUniformLocation(program, 'uniformOffset'), 1, 1)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3)

  const result: string[] = []
  if ('toDataURL' in gl.canvas) {
    result.push(gl.canvas.toDataURL())
  }
  else {
    throw new Error('Could not generate WebGL fingerprint')
  }

  return {
    hash: md5(result[0]).toString(),
    rawData: result[0],
  }
}
