/* eslint-disable @typescript-eslint/no-explicit-any */
type GPUDevice = any;
type GPUComputePipeline = any;
type GPURenderPipeline = any;
type GPUBuffer = any;
type GPUBindGroup = any;
type GPUCanvasContext = any;

const GPUBufferUsage = {
  MAP_READ: 0x0001,
  MAP_WRITE: 0x0002,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  INDEX: 0x0010,
  VERTEX: 0x0020,
  UNIFORM: 0x0040,
  STORAGE: 0x0080,
  INDIRECT: 0x0100,
  QUERY_RESOLVE: 0x0200,
};

export class WebGPUSplatSimulator {
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private computePipeline: GPUComputePipeline | null = null;
  private renderPipeline: GPURenderPipeline | null = null;
  
  private particleBuffer: GPUBuffer | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private kintsugiBuffer: GPUBuffer | null = null; // Buffer para las cicatrices (hasta 64 cicatrices)
  
  private computeBindGroup: GPUBindGroup | null = null;
  private renderBindGroup: GPUBindGroup | null = null;
  
  private splatCount: number = 0;

  public async init(canvas: HTMLCanvasElement, splatUrl?: string, defaultSplatCount: number = 100000) {
    if (typeof navigator === 'undefined' || !(navigator as any).gpu) {
      throw new Error('WebGPU no está soportado en este navegador.');
    }

    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) throw new Error('No se pudo obtener el adaptador WebGPU.');
    
    this.device = await adapter.requestDevice();
    this.context = canvas.getContext('webgpu') as any;
    
    const presentationFormat = (navigator as any).gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: presentationFormat,
      alphaMode: 'premultiplied'
    });

    this.splatCount = splatCount;

    // --- COMPUTE SHADER (Termodinámica + Interacción) ---
    const computeShaderCode = `
      struct Particle {
        pos : vec3<f32>,
        vel : vec3<f32>,
        base_pos : vec3<f32>,
        color : vec4<f32>,
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
        
        // Termodinámica (Energía cinética inyectada por el cursor)
        let dist = distance(p.pos.xy, uniforms.mouse_pos.xy);
        var force = vec3<f32>(0.0);
        if (dist < uniforms.mouse_radius) {
          // Push away and swirl (fluid-like vortex)
          let push_dir = normalize(p.pos.xy - uniforms.mouse_pos.xy);
          let vortex = vec2<f32>(-push_dir.y, push_dir.x); 
          let push_strength = (1.0 - (dist / uniforms.mouse_radius)) * uniforms.mouse_force;
          force = vec3<f32>(push_dir * push_strength + vortex * (push_strength * 0.5), push_strength * 2.0);
        }

        let spring_force = (p.base_pos - p.pos) * uniforms.spring_k;
        force = force + spring_force;

        let damping_force = -p.vel * uniforms.damping;
        force = force + damping_force;

        p.vel = p.vel + force * uniforms.delta_time;
        p.pos = p.pos + p.vel * uniforms.delta_time;

        particles[index] = p;
      }
    `;

    // --- RENDER SHADER (Kintsugi SDF) ---
    const renderShaderCode = `
      struct Particle {
        pos : vec3<f32>,
        vel : vec3<f32>,
        base_pos : vec3<f32>,
        color : vec4<f32>,
      };

      struct Scar {
        pos : vec2<f32>,
        depth : f32,
        active : f32,
      };

      struct KintsugiData {
        count: f32,
        pad1: f32,
        pad2: f32,
        pad3: f32,
        scars: array<Scar, 64>,
      };

      @group(0) @binding(0) var<storage, read> particles : array<Particle>;
      @group(0) @binding(1) var<uniform> kintsugi : KintsugiData;

      struct VertexOutput {
        @builtin(position) position : vec4<f32>,
        @location(0) color : vec4<f32>,
        @location(1) size : f32,
      };

      @vertex
      fn vs_main(@builtin(vertex_index) vertex_idx : u32) -> VertexOutput {
        var out : VertexOutput;
        let p = particles[vertex_idx];
        
        // Simple ortho projection for 2D canvas feeling
        let aspect = 1.0; 
        out.position = vec4<f32>(p.pos.x / 10.0, p.pos.y / 10.0, p.pos.z / 10.0, 1.0);
        
        // Base color from captured Splat
        var base_color = p.color.rgb;

        // Kintsugi SDF Check
        var is_scar = false;
        var min_dist = 999.0;
        
        let screen_x = (out.position.x * 0.5 + 0.5) * 1000.0;
        let screen_y = (0.5 - out.position.y * 0.5) * 1000.0; // aprox canvas size
        let frag_screen_pos = vec2<f32>(screen_x, screen_y);

        for (var i = 0u; i < u32(kintsugi.count); i = i + 1u) {
          let scar = kintsugi.scars[i];
          if (scar.active > 0.5) {
            let d = distance(frag_screen_pos, scar.pos);
            if (d < scar.depth * 20.0) {
              is_scar = true;
              min_dist = min(min_dist, d);
            }
          }
        }

        if (is_scar) {
          // Kintsugi Gold: F59E0B -> vec3(0.96, 0.62, 0.04)
          // Add metallic shine based on velocity and position
          let shine = abs(sin(p.pos.x * 10.0 + p.pos.y * 10.0)) * 0.5 + 0.5;
          out.color = vec4<f32>(0.96 * shine, 0.62 * shine, 0.04 * shine, 1.0);
          out.size = 3.0 + min_dist * 0.1; // Thicker near the scar center
        } else {
          out.color = vec4<f32>(base_color, 0.8);
          out.size = 1.5;
        }

        return out;
      }

      @fragment
      fn fs_main(in : VertexOutput) -> @location(0) vec4<f32> {
        return in.color;
      }
    `;

    const computeModule = this.device.createShaderModule({ code: computeShaderCode });
    const renderModule = this.device.createShaderModule({ code: renderShaderCode });

    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: { module: computeModule, entryPoint: 'main' },
    });

    this.renderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: renderModule, entryPoint: 'vs_main' },
      fragment: { module: renderModule, entryPoint: 'fs_main', targets: [{ format: presentationFormat }] },
      primitive: { topology: 'point-list' },
    });

    const particleStride = 64; // 3 vec3 (each 16 bytes) + 1 vec4 (16 bytes)
    const bufferSize = this.splatCount * particleStride;
    this.particleBuffer = this.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Uniforms struct: 48 bytes
    this.uniformBuffer = this.device.createBuffer({
      size: 48, 
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Kintsugi struct: count(16b padded) + 64 * 16b (Scar = vec2 + f32 + f32 = 16b) = 16 + 1024 = 1040 bytes
    this.kintsugiBuffer = this.device.createBuffer({
      size: 1040,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.computeBindGroup = this.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } },
      ],
    });

    this.renderBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.kintsugiBuffer } },
      ],
    });

    let initialData: Float32Array;

    if (splatUrl) {
      const response = await fetch(splatUrl);
      const buffer = await response.arrayBuffer();
      const splatCount = Math.floor(buffer.byteLength / 32);
      this.splatCount = splatCount;

      // Recreate buffer with actual splat count
      this.particleBuffer = this.device.createBuffer({
        size: this.splatCount * 64,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      // Re-create bind groups since buffer changed
      this.computeBindGroup = this.device.createBindGroup({
        layout: this.computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.particleBuffer } },
          { binding: 1, resource: { buffer: this.uniformBuffer } },
        ],
      });
      this.renderBindGroup = this.device.createBindGroup({
        layout: this.renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.particleBuffer } },
          { binding: 1, resource: { buffer: this.kintsugiBuffer } },
        ],
      });

      const f32View = new Float32Array(buffer);
      const u8View = new Uint8Array(buffer);

      initialData = new Float32Array(splatCount * 16);
      
      for (let i = 0; i < splatCount; i++) {
        const floatIdx = i * 8; 
        const byteIdx = i * 32;
        
        const x = f32View[floatIdx + 0] * 3.0; // scale up slightly
        const y = -f32View[floatIdx + 1] * 3.0; // invert Y
        const z = f32View[floatIdx + 2] * 3.0;
        
        // Colors
        const r = u8View[byteIdx + 24] / 255.0;
        const g = u8View[byteIdx + 25] / 255.0;
        const b = u8View[byteIdx + 26] / 255.0;
        
        const outIdx = i * 16;
        initialData[outIdx + 0] = x; initialData[outIdx + 1] = y; initialData[outIdx + 2] = z; // Base
        initialData[outIdx + 4] = 0; initialData[outIdx + 5] = 0; initialData[outIdx + 6] = 0; // Vel
        initialData[outIdx + 8] = x; initialData[outIdx + 9] = y; initialData[outIdx + 10] = z; // Pos
        initialData[outIdx + 12] = r; initialData[outIdx + 13] = g; initialData[outIdx + 14] = b; initialData[outIdx + 15] = 1.0;
      }
    } else {
      this.splatCount = defaultSplatCount;
      initialData = new Float32Array(defaultSplatCount * 16);
      const side = Math.sqrt(defaultSplatCount);
      for (let i = 0; i < defaultSplatCount; i++) {
        const outIdx = i * 16; 
        const row = Math.floor(i / side);
        const col = i % side;
        
        const x = ((col / side) - 0.5) * 20.0;
        const y = -((row / side) - 0.5) * 20.0;
        const z = (Math.random() - 0.5) * 0.5; 
        
        initialData[outIdx + 0] = x; initialData[outIdx + 1] = y; initialData[outIdx + 2] = z; 
        initialData[outIdx + 4] = 0; initialData[outIdx + 5] = 0; initialData[outIdx + 6] = 0; 
        initialData[outIdx + 8] = x; initialData[outIdx + 9] = y; initialData[outIdx + 10] = z; 
        initialData[outIdx + 12] = 0.5; initialData[outIdx + 13] = 0.5; initialData[outIdx + 14] = 0.5; initialData[outIdx + 15] = 1.0;
      }
    }
    
    this.device.queue.writeBuffer(this.particleBuffer, 0, initialData);

    return true;
  }

  public step(
    mouseX: number, mouseY: number, isDown: boolean, 
    scars: Array<{x: number, y: number, depth: number, timestamp: number}> = []
  ) {
    if (!this.device || !this.context) return;

    // Normalizar mouse a coordenadas de mundo [-10, 10] aprox
    const rect = (this.context.canvas as HTMLCanvasElement).getBoundingClientRect();
    const nx = ((mouseX - rect.left) / rect.width) * 2.0 - 1.0;
    const ny = -(((mouseY - rect.top) / rect.height) * 2.0 - 1.0);
    const worldX = nx * 10.0;
    const worldY = ny * 10.0;

    const uniformsData = new Float32Array([
      worldX, worldY, 0.0, 0.0, // mouse_pos (16b)
      4.0, // mouse_radius
      isDown ? 150.0 : 0.0, // mouse_force
      12.0, // spring_k
      2.8, // damping
      0.016, // delta_time
      0.0, 0.0, 0.0 // padding to 48 bytes
    ]);
    this.device.queue.writeBuffer(this.uniformBuffer!, 0, uniformsData);

    // Kintsugi Data (1040 bytes -> 260 floats)
    const kintsugiData = new Float32Array(260);
    kintsugiData[0] = Math.min(scars.length, 64);
    for(let i = 0; i < Math.min(scars.length, 64); i++) {
      const idx = 4 + (i * 4);
      // Scar screen space coordinates for easy mapping
      kintsugiData[idx + 0] = scars[i].x; 
      kintsugiData[idx + 1] = scars[i].y;
      kintsugiData[idx + 2] = scars[i].depth;
      kintsugiData[idx + 3] = 1.0; // active
    }
    this.device.queue.writeBuffer(this.kintsugiBuffer!, 0, kintsugiData);

    const commandEncoder = this.device.createCommandEncoder();
    
    // COMPUTE
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.computePipeline!);
    computePass.setBindGroup(0, this.computeBindGroup!);
    computePass.dispatchWorkgroups(Math.ceil(this.splatCount / 64));
    computePass.end();

    // RENDER
    const textureView = this.context.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.04, g: 0.04, b: 0.05, a: 1.0 }, // Noir background
        loadOp: 'clear',
        storeOp: 'store'
      }]
    });
    renderPass.setPipeline(this.renderPipeline!);
    renderPass.setBindGroup(0, this.renderBindGroup!);
    renderPass.draw(this.splatCount);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
