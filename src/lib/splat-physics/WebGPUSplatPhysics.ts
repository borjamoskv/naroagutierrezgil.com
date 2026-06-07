export class WebGPUSplatSimulator {
  private device: GPUDevice | null = null;
  private pipeline: GPUComputePipeline | null = null;
  private particleBuffer: GPUBuffer | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;

  public async init(splatCount: number = 100000) {
    if (!navigator.gpu) {
      throw new Error('WebGPU no está soportado en este navegador.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No se pudo obtener el adaptador WebGPU.');
    
    this.device = await adapter.requestDevice();

    // Shader WGSL para deformación elástica (Spring-Mass System)
    const computeShaderCode = `
      struct Particle {
        pos : vec3<f32>,
        vel : vec3<f32>,
        base_pos : vec3<f32>,
      };

      struct Uniforms {
        mouse_pos : vec3<f32>,
        mouse_radius : f32,
        mouse_force : f32,
        spring_k : f32,
        damping : f32,
        delta_time : f32,
      };

      @group(0) @binding(0) var<storage, read_write> particles : array<Particle>;
      @group(0) @binding(1) var<uniform> uniforms : Uniforms;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
        let index = GlobalInvocationID.x;
        if (index >= arrayLength(&particles)) {
          return;
        }

        var p = particles[index];
        
        // 1. Fuerza externa (Mouse/Interacción)
        let dist = distance(p.pos, uniforms.mouse_pos);
        var force = vec3<f32>(0.0);
        if (dist < uniforms.mouse_radius) {
          let push_dir = normalize(p.pos - uniforms.mouse_pos);
          let push_strength = (1.0 - (dist / uniforms.mouse_radius)) * uniforms.mouse_force;
          force = force + push_dir * push_strength;
        }

        // 2. Fuerza elástica (retorno a la posición base del kintsugi/splat)
        let spring_force = (p.base_pos - p.pos) * uniforms.spring_k;
        force = force + spring_force;

        // 3. Fricción / Amortiguación
        let damping_force = -p.vel * uniforms.damping;
        force = force + damping_force;

        // 4. Integración de Euler (f = m*a, asumiendo m=1)
        p.vel = p.vel + force * uniforms.delta_time;
        p.pos = p.pos + p.vel * uniforms.delta_time;

        particles[index] = p;
      }
    `;

    const shaderModule = this.device.createShaderModule({ code: computeShaderCode });

    this.pipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    // Inicializar buffer de splats (100k partículas)
    // Particle struct: pos (16 bytes) + vel (16 bytes) + base_pos (16 bytes) = 48 bytes
    const bufferSize = splatCount * 48;
    this.particleBuffer = this.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });

    // Uniforms struct: 6 floats (vec3 + 3 f32) -> 32 bytes con padding
    this.uniformBuffer = this.device.createBuffer({
      size: 32, 
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } },
      ],
    });

    // Inyectar estado inicial determinista (Simulando nube de splats)
    const initialData = new Float32Array(bufferSize / 4);
    for (let i = 0; i < splatCount; i++) {
      const idx = i * 12; // 3 vec3 * 4 floats
      // Base Pos
      initialData[idx + 0] = (Math.random() - 0.5) * 10;
      initialData[idx + 1] = (Math.random() - 0.5) * 10;
      initialData[idx + 2] = (Math.random() - 0.5) * 2;
      // Pos (empieza igual que Base Pos)
      initialData[idx + 8] = initialData[idx + 0];
      initialData[idx + 9] = initialData[idx + 1];
      initialData[idx + 10] = initialData[idx + 2];
    }
    this.device.queue.writeBuffer(this.particleBuffer, 0, initialData);

    return true;
  }

  public step(mouseX: number, mouseY: number, isDown: boolean, splatCount: number = 100000) {
    if (!this.device || !this.pipeline || !this.bindGroup) return;

    // Actualizar Uniforms
    const uniformsData = new Float32Array([
      mouseX, mouseY, 0.0, 0.0, // mouse_pos (vec3 con padding)
      2.0, // mouse_radius
      isDown ? 50.0 : 0.0, // mouse_force
      10.0, // spring_k
      2.5, // damping
      0.016 // delta_time (~60fps)
    ]);
    this.device.queue.writeBuffer(this.uniformBuffer!, 0, uniformsData);

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);
    passEncoder.dispatchWorkgroups(Math.ceil(splatCount / 64));
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
