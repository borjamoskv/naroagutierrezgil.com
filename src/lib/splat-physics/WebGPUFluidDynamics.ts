/* eslint-disable @typescript-eslint/no-explicit-any */
type GPUDevice = any;
type GPUComputePipeline = any;
type GPUBuffer = any;
type GPUBindGroup = any;
type GPUBindGroupLayout = any;

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

export class WebGPUFluidSimulator {
  private device: GPUDevice | null = null;
  
  public gridWidth: number = 256;
  public gridHeight: number = 256;
  private numCells: number = 256 * 256;

  private pipelineInject: GPUComputePipeline | null = null;
  private pipelineAdvectVel: GPUComputePipeline | null = null;
  private pipelineAdvectDye: GPUComputePipeline | null = null;
  private pipelineDivergence: GPUComputePipeline | null = null;
  private pipelineJacobi: GPUComputePipeline | null = null;
  private pipelineSubtract: GPUComputePipeline | null = null;

  private velRead: GPUBuffer | null = null;
  private velWrite: GPUBuffer | null = null;
  private dyeRead: GPUBuffer | null = null;
  private dyeWrite: GPUBuffer | null = null;
  private pressureRead: GPUBuffer | null = null;
  private pressureWrite: GPUBuffer | null = null;
  private uniforms: GPUBuffer | null = null;

  private bindGroupLayoutAdvect: GPUBindGroupLayout | null = null;
  private renderPipeline: any | null = null;
  private divergenceBuf: GPUBuffer | null = null;
  private bindGroups: Map<string, GPUBindGroup> = new Map();

  public async init(width: number = 256, height: number = 256) {
    if (typeof navigator === 'undefined' || !(navigator as any).gpu) {
      throw new Error('WebGPU no está soportado en este navegador.');
    }

    this.gridWidth = width;
    this.gridHeight = height;
    this.numCells = width * height;

    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) throw new Error('No se pudo obtener el adaptador WebGPU.');
    this.device = await adapter.requestDevice();

    const wgslSource = `
      struct Uniforms {
        grid_size : vec2<f32>,
        dt : f32,
        dissipation : f32,
        mouse_pos : vec2<f32>,
        mouse_dir : vec2<f32>,
        mouse_force : f32,
        mouse_radius : f32,
      };

      @group(0) @binding(0) var<uniform> params : Uniforms;

      // Buffers genéricos
      @group(1) @binding(0) var<storage, read> r_vel : array<vec2<f32>>;
      @group(1) @binding(1) var<storage, read_write> w_vel : array<vec2<f32>>;
      
      @group(1) @binding(2) var<storage, read> r_dye : array<vec4<f32>>;
      @group(1) @binding(3) var<storage, read_write> w_dye : array<vec4<f32>>;

      @group(1) @binding(4) var<storage, read> r_pressure : array<f32>;
      @group(1) @binding(5) var<storage, read_write> w_pressure : array<f32>;

      @group(1) @binding(6) var<storage, read_write> div_buf : array<f32>;

      fn get_idx(x: i32, y: i32) -> i32 {
        let cx = clamp(x, 0, i32(params.grid_size.x) - 1);
        let cy = clamp(y, 0, i32(params.grid_size.y) - 1);
        return cy * i32(params.grid_size.x) + cx;
      }

      // Bilinear interpolation for vec2
      fn bilerp_vec2(pos: vec2<f32>, arr: ptr<storage, array<vec2<f32>>, read>) -> vec2<f32> {
        let st = pos - 0.5;
        let st1 = vec2<i32>(i32(floor(st.x)), i32(floor(st.y)));
        let t = st.x - f32(st1.x);
        let s = st.y - f32(st1.y);

        let tl = (*arr)[get_idx(st1.x,     st1.y)];
        let tr = (*arr)[get_idx(st1.x + 1, st1.y)];
        let bl = (*arr)[get_idx(st1.x,     st1.y + 1)];
        let br = (*arr)[get_idx(st1.x + 1, st1.y + 1)];

        let top = mix(tl, tr, t);
        let bottom = mix(bl, br, t);
        return mix(top, bottom, s);
      }

      // Bilinear interpolation for vec4
      fn bilerp_vec4(pos: vec2<f32>, arr: ptr<storage, array<vec4<f32>>, read>) -> vec4<f32> {
        let st = pos - 0.5;
        let st1 = vec2<i32>(i32(floor(st.x)), i32(floor(st.y)));
        let t = st.x - f32(st1.x);
        let s = st.y - f32(st1.y);

        let tl = (*arr)[get_idx(st1.x,     st1.y)];
        let tr = (*arr)[get_idx(st1.x + 1, st1.y)];
        let bl = (*arr)[get_idx(st1.x,     st1.y + 1)];
        let br = (*arr)[get_idx(st1.x + 1, st1.y + 1)];

        let top = mix(tl, tr, t);
        let bottom = mix(bl, br, t);
        return mix(top, bottom, s);
      }

      @compute @workgroup_size(16, 16)
      fn inject(@builtin(global_invocation_id) id: vec3<u32>) {
        if (f32(id.x) >= params.grid_size.x || f32(id.y) >= params.grid_size.y) { return; }
        let idx = get_idx(i32(id.x), i32(id.y));
        let cell_center = vec2<f32>(f32(id.x) + 0.5, f32(id.y) + 0.5);
        let dist = distance(cell_center, params.mouse_pos);

        if (dist < params.mouse_radius && params.mouse_force > 0.0) {
          let strength = exp(-dist*dist / (params.mouse_radius*params.mouse_radius/2.0));
          w_vel[idx] = r_vel[idx] + params.mouse_dir * params.mouse_force * strength;
          
          // Inject Dye (Gold/Blueish for Kintsugi aesthetic)
          let inject_color = vec4<f32>(0.96, 0.62, 0.04, 1.0) * strength; // Amber/Gold
          w_dye[idx] = r_dye[idx] + inject_color;
        } else {
          w_vel[idx] = r_vel[idx];
          w_dye[idx] = r_dye[idx];
        }
      }

      @compute @workgroup_size(16, 16)
      fn advect_vel(@builtin(global_invocation_id) id: vec3<u32>) {
        if (f32(id.x) >= params.grid_size.x || f32(id.y) >= params.grid_size.y) { return; }
        let idx = get_idx(i32(id.x), i32(id.y));
        let pos = vec2<f32>(f32(id.x) + 0.5, f32(id.y) + 0.5);
        let vel = r_vel[idx];
        let past_pos = pos - vel * params.dt;
        w_vel[idx] = params.dissipation * bilerp_vec2(past_pos, &r_vel);
      }

      @compute @workgroup_size(16, 16)
      fn advect_dye(@builtin(global_invocation_id) id: vec3<u32>) {
        if (f32(id.x) >= params.grid_size.x || f32(id.y) >= params.grid_size.y) { return; }
        let idx = get_idx(i32(id.x), i32(id.y));
        let pos = vec2<f32>(f32(id.x) + 0.5, f32(id.y) + 0.5);
        let vel = r_vel[idx]; // Usa la velocidad para mover el tinte
        let past_pos = pos - vel * params.dt;
        w_dye[idx] = params.dissipation * bilerp_vec4(past_pos, &r_dye);
      }

      @compute @workgroup_size(16, 16)
      fn divergence(@builtin(global_invocation_id) id: vec3<u32>) {
        let x = i32(id.x);
        let y = i32(id.y);
        if (f32(x) >= params.grid_size.x || f32(y) >= params.grid_size.y) { return; }
        
        let L = r_vel[get_idx(x - 1, y)].x;
        let R = r_vel[get_idx(x + 1, y)].x;
        let T = r_vel[get_idx(x, y - 1)].y;
        let B = r_vel[get_idx(x, y + 1)].y;

        let div = 0.5 * ((R - L) + (B - T));
        div_buf[get_idx(x, y)] = div;
        w_pressure[get_idx(x, y)] = 0.0; // Reset pressure
      }

      @compute @workgroup_size(16, 16)
      fn jacobi(@builtin(global_invocation_id) id: vec3<u32>) {
        let x = i32(id.x);
        let y = i32(id.y);
        if (f32(x) >= params.grid_size.x || f32(y) >= params.grid_size.y) { return; }
        
        let L = r_pressure[get_idx(x - 1, y)];
        let R = r_pressure[get_idx(x + 1, y)];
        let T = r_pressure[get_idx(x, y - 1)];
        let B = r_pressure[get_idx(x, y + 1)];
        let bC = div_buf[get_idx(x, y)];

        w_pressure[get_idx(x, y)] = (L + R + T + B - bC) * 0.25;
      }

      @compute @workgroup_size(16, 16)
      fn subtract(@builtin(global_invocation_id) id: vec3<u32>) {
        let x = i32(id.x);
        let y = i32(id.y);
        if (f32(x) >= params.grid_size.x || f32(y) >= params.grid_size.y) { return; }
        
        let L = r_pressure[get_idx(x - 1, y)];
        let R = r_pressure[get_idx(x + 1, y)];
        let T = r_pressure[get_idx(x, y - 1)];
        let B = r_pressure[get_idx(x, y + 1)];

        let vel = r_vel[get_idx(x, y)];
        w_vel[get_idx(x, y)] = vel - vec2<f32>(R - L, B - T) * 0.5;
      }

      // --- RENDER PASS (FULL SCREEN QUAD) ---
      struct VertexOutput {
        @builtin(position) position : vec4<f32>,
        @location(0) uv : vec2<f32>,
      };

      @vertex
      fn vs_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
        var pos = array<vec2<f32>, 6>(
          vec2<f32>(-1.0, -1.0), vec2<f32>( 1.0, -1.0), vec2<f32>(-1.0,  1.0),
          vec2<f32>(-1.0,  1.0), vec2<f32>( 1.0, -1.0), vec2<f32>( 1.0,  1.0)
        );
        var output : VertexOutput;
        output.position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        output.uv = pos[VertexIndex] * 0.5 + 0.5;
        output.uv.y = 1.0 - output.uv.y; // Flip Y
        return output;
      }

      @fragment
      fn fs_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
        let x = i32(uv.x * params.grid_size.x);
        let y = i32(uv.y * params.grid_size.y);
        // Binding 2 of group 1 is r_dye 
        let color = r_dye[get_idx(x, y)];
        return vec4<f32>(color.rgb, clamp(length(color.rgb), 0.0, 1.0));
      }
    `;

    const shaderModule = this.device.createShaderModule({ code: wgslSource });

    const createPipeline = (entryPoint: string) => this.device!.createComputePipeline({
      layout: 'auto',
      compute: { module: shaderModule, entryPoint }
    });

    this.pipelineInject = createPipeline('inject');
    this.pipelineAdvectVel = createPipeline('advect_vel');
    this.pipelineAdvectDye = createPipeline('advect_dye');
    this.pipelineDivergence = createPipeline('divergence');
    this.pipelineJacobi = createPipeline('jacobi');
    this.pipelineSubtract = createPipeline('subtract');

    const createBuffer = (size: number, usage: number) => this.device!.createBuffer({ size, usage });

    this.velRead = createBuffer(this.numCells * 8, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    this.velWrite = createBuffer(this.numCells * 8, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    this.dyeRead = createBuffer(this.numCells * 16, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    this.dyeWrite = createBuffer(this.numCells * 16, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    this.pressureRead = createBuffer(this.numCells * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    this.pressureWrite = createBuffer(this.numCells * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    
    // El buffer divergenceBuf fue borrado del array de properties accidentalmente, hay que restaurarlo si falta
    this.divergenceBuf = createBuffer(this.numCells * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    
    this.uniforms = createBuffer(48, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    this.bindGroupLayoutAdvect = this.pipelineAdvectVel.getBindGroupLayout(1);
    
    // Configurar pipeline de renderizado usando el mismo shaderModule
    this.renderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{
          format: (navigator as any).gpu.getPreferredCanvasFormat(),
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }
          }
        }],
      },
      primitive: { topology: 'triangle-list' },
    });

    return true;
  }

  private createBindGroup(layout: GPUBindGroupLayout, vR: GPUBuffer, vW: GPUBuffer, dR: GPUBuffer, dW: GPUBuffer, pR: GPUBuffer, pW: GPUBuffer) {
    return this.device!.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: vR } },
        { binding: 1, resource: { buffer: vW } },
        { binding: 2, resource: { buffer: dR } },
        { binding: 3, resource: { buffer: dW } },
        { binding: 4, resource: { buffer: pR } },
        { binding: 5, resource: { buffer: pW } },
        { binding: 6, resource: { buffer: this.divergenceBuf! } },
      ]
    });
  }

  public step(mouseX: number, mouseY: number, mouseDirX: number, mouseDirY: number, force: number) {
    if (!this.device) return;

    // Uniforms struct: 
    // grid_size (8 bytes), dt (4), dissipation (4), mouse_pos (8), mouse_dir (8), mouse_force (4), mouse_radius (4) => 40 bytes (padded to 48)
    const uniformsData = new Float32Array([
      this.gridWidth, this.gridHeight,
      0.016, // dt
      0.99,  // dissipation
      mouseX, mouseY,
      mouseDirX, mouseDirY,
      force,
      10.0, // mouse_radius
      0.0, 0.0 // padding
    ]);
    this.device.queue.writeBuffer(this.uniforms!, 0, uniformsData);

    const group0 = this.device.createBindGroup({
      layout: this.pipelineInject!.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniforms! } }]
    });

    const dispatchX = Math.ceil(this.gridWidth / 16);
    const dispatchY = Math.ceil(this.gridHeight / 16);

    const encoder = this.device.createCommandEncoder();
    
    // Inject Pass
    let pass = encoder.beginComputePass();
    pass.setPipeline(this.pipelineInject!);
    pass.setBindGroup(0, group0);
    pass.setBindGroup(1, this.createBindGroup(this.bindGroupLayoutAdvect!, this.velRead!, this.velWrite!, this.dyeRead!, this.dyeWrite!, this.pressureRead!, this.pressureWrite!));
    pass.dispatchWorkgroups(dispatchX, dispatchY);
    pass.end();
    this.swapVelocity(); this.swapDye();

    // Advect Velocity
    pass = encoder.beginComputePass();
    pass.setPipeline(this.pipelineAdvectVel!);
    pass.setBindGroup(0, group0);
    pass.setBindGroup(1, this.createBindGroup(this.bindGroupLayoutAdvect!, this.velRead!, this.velWrite!, this.dyeRead!, this.dyeWrite!, this.pressureRead!, this.pressureWrite!));
    pass.dispatchWorkgroups(dispatchX, dispatchY);
    pass.end();
    this.swapVelocity();

    // Advect Dye
    pass = encoder.beginComputePass();
    pass.setPipeline(this.pipelineAdvectDye!);
    pass.setBindGroup(0, group0);
    pass.setBindGroup(1, this.createBindGroup(this.bindGroupLayoutAdvect!, this.velRead!, this.velWrite!, this.dyeRead!, this.dyeWrite!, this.pressureRead!, this.pressureWrite!));
    pass.dispatchWorkgroups(dispatchX, dispatchY);
    pass.end();
    this.swapDye();

    // Divergence
    pass = encoder.beginComputePass();
    pass.setPipeline(this.pipelineDivergence!);
    pass.setBindGroup(0, group0);
    pass.setBindGroup(1, this.createBindGroup(this.bindGroupLayoutAdvect!, this.velRead!, this.velWrite!, this.dyeRead!, this.dyeWrite!, this.pressureRead!, this.pressureWrite!));
    pass.dispatchWorkgroups(dispatchX, dispatchY);
    pass.end();
    this.swapPressure();

    // Jacobi (Pressure solver - 20 iterations)
    for (let i = 0; i < 20; i++) {
      pass = encoder.beginComputePass();
      pass.setPipeline(this.pipelineJacobi!);
      pass.setBindGroup(0, group0);
      pass.setBindGroup(1, this.createBindGroup(this.bindGroupLayoutAdvect!, this.velRead!, this.velWrite!, this.dyeRead!, this.dyeWrite!, this.pressureRead!, this.pressureWrite!));
      pass.dispatchWorkgroups(dispatchX, dispatchY);
      pass.end();
      this.swapPressure();
    }

    // Subtract Gradient
    pass = encoder.beginComputePass();
    pass.setPipeline(this.pipelineSubtract!);
    pass.setBindGroup(0, group0);
    pass.setBindGroup(1, this.createBindGroup(this.bindGroupLayoutAdvect!, this.velRead!, this.velWrite!, this.dyeRead!, this.dyeWrite!, this.pressureRead!, this.pressureWrite!));
    pass.dispatchWorkgroups(dispatchX, dispatchY);
    pass.end();
    this.swapVelocity();

    this.device.queue.submit([encoder.finish()]);
  }

  private swapVelocity() { const t = this.velRead; this.velRead = this.velWrite; this.velWrite = t; }
  private swapDye() { const t = this.dyeRead; this.dyeRead = this.dyeWrite; this.dyeWrite = t; }
  private swapPressure() { const t = this.pressureRead; this.pressureRead = this.pressureWrite; this.pressureWrite = t; }

  public getDyeBuffer() { return this.dyeRead; }
}
