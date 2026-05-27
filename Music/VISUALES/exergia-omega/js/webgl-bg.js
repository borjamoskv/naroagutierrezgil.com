/**
 * EXERGIA-Ω // AESTHETIC-OMEGA WebGL Shader
 * Reality: C5-REAL (GPU Accelerated)
 * Aesthetic: Industrial Noir 2026 (#0A0A0A / #2B3BE5 / #FF9F1C)
 * Fully Audio-Reactive & Cursor Responsive Substrate
 */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("webgl-background");
  if (!canvas) return;
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  // Vertex Shader: Pass through
  const vsSource = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
            vUv = position * 0.5 + 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

  // Fragment Shader: Industrial Noir Fluid Dynamics
  const fsSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_entropy;
        uniform float u_cortisol;
        uniform float u_audio_rms;
        uniform float u_audio_peak;
        uniform float u_audio_low;
        uniform float u_audio_high;
        uniform float u_audio_corr;
        uniform vec2 u_mouse;
        varying vec2 vUv;

        // Simplex noise approximation
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;

            // Aspect-ratio-corrected mouse tracking
            vec2 mouseProj = u_mouse;
            mouseProj.x *= u_resolution.x / u_resolution.y;
            float mouseDist = length(st - mouseProj);
            float mouseGlow = smoothstep(0.4, 0.0, mouseDist);

            // Slow drifting coordinates, modulated by u_entropy, bass (u_audio_low), and mouse warp
            vec2 pos = st * (3.0 + u_entropy * 0.5);
            
            // Local mouse gravitational warp
            pos += (st - mouseProj) * mouseGlow * 0.35;
            
            // Sub-bass warping grid
            pos += vec2(sin(st.y * 8.0 + u_time), cos(st.x * 8.0 - u_time)) * u_audio_low * 0.12;

            float t = u_time * (0.15 + u_entropy * 1.5 + u_audio_rms * 0.5);
            
            // Domain warping
            float q = snoise(pos + vec2(t, t * 0.8));
            float r = snoise(pos + vec2(q * 2.0 - t * 0.5, q * 1.5 + t * 0.3));
            float s = snoise(pos + vec2(r * 2.0 + t * 0.2, r * 1.5 - t * 0.6));
            float n = snoise(pos + s * 2.5 + t);

            // Base color: Abyssal Black #0A0A0A
            vec3 color = vec3(0.039, 0.039, 0.039);
            
            // Highlights: YInMn Blue, Sovereign Amber, Neon Pink, Cyber Cyan
            vec3 colorBlue = vec3(0.169, 0.231, 0.898);
            vec3 colorAmber = vec3(1.0, 0.624, 0.110);
            vec3 colorDeepBlue = vec3(0.05, 0.08, 0.35);
            vec3 colorNeonPink = vec3(1.0, 0.0, 0.5);
            vec3 colorCyberCyan = vec3(0.0, 1.0, 1.0);
            
            // Mix colors based on noise, entropy, time, and real-time audio levels
            float pinkIntensity = 0.18 + u_audio_rms * 0.5 + u_audio_high * 0.4;
            float cyanIntensity = 0.18 + u_audio_rms * 0.4 + u_audio_low * 0.3;
            
            color = mix(color, colorDeepBlue, smoothstep(-0.2, 0.5, q) * 0.5);
            color = mix(color, colorBlue, smoothstep(0.0, 0.85, n) * (0.4 + u_entropy * 0.2));
            color = mix(color, colorAmber, smoothstep(0.7, 1.0, r) * (0.2 + u_entropy * 0.3));
            color = mix(color, colorNeonPink, smoothstep(0.4, 0.9, sin(q * 5.0 + u_time)) * pinkIntensity);
            color = mix(color, colorCyberCyan, smoothstep(0.5, 1.0, cos(r * 4.0 - u_time * 0.5)) * cyanIntensity); 
            
            // Add subtle interactive cursor trail aura
            color = mix(color, colorCyberCyan * 0.5 + colorNeonPink * 0.3, mouseGlow * 0.25);
            
            // Vignette for focus
            vec2 center = gl_FragCoord.xy / u_resolution.xy - 0.5;
            float dist = length(center);
            color *= smoothstep(0.9, 0.25, dist); 

            // CRT Scanline emulation
            float scanline = sin(gl_FragCoord.y * 1.5) * (0.03 + u_cortisol * 0.05 + u_audio_rms * 0.02);
            color -= scanline;
            
            // Phosphor glow bleed, shifting to Danger Red under high cortisol
            vec3 alertColor = mix(vec3(1.0, 0.624, 0.110), vec3(0.9, 0.17, 0.31), u_cortisol);
            color += mix(colorBlue * 0.02, alertColor * 0.08, u_cortisol);
            
            // Chromatic aberration (Glitch) induced by cortisol stress or audio transient peak hits
            float totalGlitch = u_cortisol + u_audio_peak * 0.5;
            if (totalGlitch > 0.3) {
                float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time) * 43758.5453);
                float glitchLine = step(0.98 - totalGlitch * 0.05, noise);
                color.r += glitchLine * totalGlitch * 0.12;
                color.b -= glitchLine * totalGlitch * 0.08;
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `;

  function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uEntropy = gl.getUniformLocation(program, "u_entropy");
  const uCortisol = gl.getUniformLocation(program, "u_cortisol");
  const uAudioRms = gl.getUniformLocation(program, "u_audio_rms");
  const uAudioPeak = gl.getUniformLocation(program, "u_audio_peak");
  const uAudioLow = gl.getUniformLocation(program, "u_audio_low");
  const uAudioHigh = gl.getUniformLocation(program, "u_audio_high");
  const uAudioCorr = gl.getUniformLocation(program, "u_audio_corr");
  const uMouse = gl.getUniformLocation(program, "u_mouse");

  // Mouse coords state and lerp targets
  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;

  window.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = 1.0 - e.clientY / window.innerHeight;
  });

  // Touch support for mobile layouts
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      targetMouseX = e.touches[0].clientX / window.innerWidth;
      targetMouseY = 1.0 - e.touches[0].clientY / window.innerHeight;
    }
  });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
    }
    // Debounced resize — prevents thrashing the WebGL viewport during window drag
    let _glResizeTimer = null;
    window.addEventListener('resize', () => {
        if (_glResizeTimer) clearTimeout(_glResizeTimer);
        _glResizeTimer = setTimeout(resize, 150);
    });
    resize();

    // Tab visibility gate
    let _glVisible = true;
    document.addEventListener('visibilitychange', () => {
        _glVisible = !document.hidden;
    });

  let startTime = performance.now();
  function render() {
    requestAnimationFrame(render);

    // Skip GPU work entirely when tab is hidden
    if (!_glVisible) return;
    
    const time = (performance.now() - startTime) * 0.001;
    gl.uniform1f(uTime, time);

    // Feed real-time telemetry entropy and cortisol to the shader
    const entropy =
      window.CORTEX_TELEMETRY && window.CORTEX_TELEMETRY.smoothedEntropy
        ? window.CORTEX_TELEMETRY.smoothedEntropy
        : 0.0;
    gl.uniform1f(uEntropy, entropy);

    const cortisol =
      window.CORTEX_TELEMETRY && window.CORTEX_TELEMETRY.smoothedCortisol
        ? window.CORTEX_TELEMETRY.smoothedCortisol
        : 0.0;
    gl.uniform1f(uCortisol, cortisol);

    // Feed real-time audio analysis data
    const audio = window.EXERGIA_AUDIO || {
      rms: 0,
      peak: 0,
      low: 0,
      high: 0,
      correlation: 1.0,
    };
    gl.uniform1f(uAudioRms, audio.rms);
    gl.uniform1f(uAudioPeak, audio.peak);
    gl.uniform1f(uAudioLow, audio.low);
    gl.uniform1f(uAudioHigh, audio.high);
    gl.uniform1f(uAudioCorr, audio.correlation);

    // Smooth mouse coordinates LERP
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;
    gl.uniform2f(uMouse, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  render();
});
