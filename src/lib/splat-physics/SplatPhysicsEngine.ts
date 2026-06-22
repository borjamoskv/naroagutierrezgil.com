// C5-REAL: WebGPU Physics Engine for Gaussian Splats
// Computes spring-mass systems and cursor interaction in compute shaders

/* eslint-disable @typescript-eslint/no-explicit-any */
type GPUDevice = any;
type GPUComputePipeline = any;
type GPURenderPipeline = any;
type GPUBuffer = any;
type GPUBindGroup = any;
type GPUCanvasContext = any;
type GPURenderPassDescriptor = any;

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

const PHYSICS_COMPUTE_SHADER = `
struct AgentData {
  pos: vec2<f32>,
  isDrawing: f32,
  padding: f32,
}

struct PhysicsUniforms {
  time: f32,
  force: f32,
  elasticity: f32,
  damping: f32,
  heatRate: f32,
  zoom: f32,
  agentCount: f32,
  padding: f32,
  agents: array<AgentData, 101>,
}

@group(0) @binding(0) var<uniform> uniforms: PhysicsUniforms;
@group(0) @binding(1) var<storage, read> originalPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> currentPos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec4<f32>>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= arrayLength(&originalPos)) {
    return;
  }

  let orig = originalPos[idx].xyz;
  var pos = currentPos[idx].xyz;
  var vel = velocities[idx].xyz;
  var heat = velocities[idx].w;

  // 1. Spring force (elastic return)
  let springVector = orig - pos;
  let springForce = springVector * uniforms.elasticity;

  // 2. Multi-agent interaction (repulsion & thermodynamic heat excitation)
  var repulsion = vec3<f32>(0.0);
  let limit = i32(uniforms.agentCount);
  for (var i: i32 = 0; i < limit; i = i + 1) {
    let agent = uniforms.agents[i];
    let distVec = pos.xy - agent.pos;
    let dist = length(distVec);
    
    if (dist < 0.6) {
      let isDrawing = agent.isDrawing;
      let forceMult = isDrawing * 0.8 + 0.2;
      let strength = (0.6 - dist) * uniforms.force * forceMult;
      
      var dir = vec2<f32>(0.0);
      if (dist > 0.001) {
        dir = normalize(distVec);
      }
      repulsion = repulsion + vec3<f32>(dir * strength * 0.8, strength * 1.5);
      
      // Accumulate heat (Thermodynamic impact)
      heat = heat + (0.6 - dist) * uniforms.heatRate * forceMult;
    }
  }

  // Heat decay / damping over time
  heat = heat * 0.94;

  // 3. Physics integration
  let thermalNoise = vec3<f32>(
    sin(uniforms.time * 60.0 + f32(idx)) * 0.04 * heat,
    cos(uniforms.time * 50.0 + f32(idx)) * 0.04 * heat,
    sin(uniforms.time * 40.0 + f32(idx)) * 0.04 * heat
  );

  let accel = springForce + repulsion;
  vel = (vel + accel) * uniforms.damping;
  pos = pos + vel + thermalNoise;

  // Store state back
  currentPos[idx] = vec4<f32>(pos, originalPos[idx].w);
  velocities[idx] = vec4<f32>(vel, heat);
}
`;

const RENDER_SHADER = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) size: f32,
};

struct RenderUniforms {
  viewProjection: mat4x4<f32>,
  primaryColor: vec3<f32>,
  zoom: f32,
  lightPos: vec2<f32>,
  padding: vec2<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: RenderUniforms;
@group(0) @binding(1) var<storage, read> positions: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> velocities: array<vec4<f32>>;

@vertex
fn vs_main(@builtin(vertex_index) vertex_idx: u32) -> VertexOutput {
  var out: VertexOutput;
  let pos = positions[vertex_idx].xyz;
  let heat = velocities[vertex_idx].w;
  
  // Projection
  out.position = uniforms.viewProjection * vec4<f32>(pos, 1.0);
  
  // 1. El Retrato Existe Dentro De La Piedra (Excavación Volumétrica)
  // Base slate color is dark grey
  let slateColor = vec3<f32>(0.06, 0.06, 0.07);
  
  // Target color is the glowing primary/artwork colors
  let paintColor = uniforms.primaryColor * (0.6 + 0.4 * sin(pos.z * 5.0 + pos.x * 2.0));
  
  // Luz rasante (grazing light) based on lightPos
  let distToLight = distance(pos.xy, uniforms.lightPos);
  let lightIntensity = max(0.04, 1.0 - (distToLight / 0.75));
  
  // Reveal color under light
  var baseCol = mix(slateColor, paintColor, lightIntensity);
  
  // 4. Radiance Memory & Pizarra Termodinámica: Heat turns color into gold/amber glow
  let glowColor = vec3<f32>(1.0, 0.62, 0.11); // Gold/Amber glow
  out.color = mix(baseCol, glowColor, min(1.0, heat * 2.5));
  
  // 2. Microscopio Neural & 6. Realidad Inestable
  // Point size increases as we zoom in (Microscopio Neural), but decays or scrambles if too close
  var sizeVal = 3.0;
  if (uniforms.zoom > 1.5) {
    sizeVal = max(1.0, 4.0 / (uniforms.zoom * 0.4));
  }
  
  // Realidad inestable: if zoom is extreme, make particles disperse or render smaller to see mathematical grain
  if (uniforms.zoom > 3.0) {
    sizeVal = sizeVal * 0.7;
  }
  
  out.size = sizeVal;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 0.8);
}
`;

export class SplatPhysicsEngine {
  public device: GPUDevice | null = null;
  private computePipeline: GPUComputePipeline | null = null;
  private renderPipeline: GPURenderPipeline | null = null;
  
  // Buffers
  private originalBuffer: GPUBuffer | null = null;
  private currentBuffer: GPUBuffer | null = null;
  private velocityBuffer: GPUBuffer | null = null;
  private computeUniformBuffer: GPUBuffer | null = null;
  private renderUniformBuffer: GPUBuffer | null = null;
  
  // Bind Groups
  private computeBindGroup: GPUBindGroup | null = null;
  private renderBindGroup: GPUBindGroup | null = null;
  
  private count: number = 0;
  
  constructor() {}
  
  public async init(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !(navigator as any).gpu) {
      return false;
    }
    
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) return false;
      
      this.device = await adapter.requestDevice();
      if (!this.device) return false;
      
      // Compile shaders
      const computeModule = this.device.createShaderModule({
        code: PHYSICS_COMPUTE_SHADER
      });
      
      const renderModule = this.device.createShaderModule({
        code: RENDER_SHADER
      });
      
      // Compute Pipeline Setup
      this.computePipeline = this.device.createComputePipeline({
        layout: "auto",
        compute: {
          module: computeModule,
          entryPoint: "main"
        }
      });
      
      // Render Pipeline Setup
      this.renderPipeline = this.device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: renderModule,
          entryPoint: "vs_main"
        },
        fragment: {
          module: renderModule,
          entryPoint: "fs_main",
          targets: [{ format: "bgra8unorm" }] // default target format
        },
        primitive: {
          topology: "point-list"
        }
      });
      
      return true;
    } catch (e) {
      console.error("Failed to initialize WebGPU Engine:", e);
      return false;
    }
  }
  
  public setupData(positions: Float32Array) {
    if (!this.device) return;
    
    this.count = positions.length / 4; // vec4
    const bufferSize = positions.byteLength;
    
    // 1. Original Position buffer (Read only)
    this.originalBuffer = this.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });
    this.device.queue.writeBuffer(this.originalBuffer, 0, positions);
    
    // 2. Current Position buffer (Read/Write & Vertex input)
    this.currentBuffer = this.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.VERTEX,
      mappedAtCreation: false
    });
    this.device.queue.writeBuffer(this.currentBuffer, 0, positions);
    
    // 3. Velocities buffer (Read/Write)
    const velocities = new Float32Array(this.count * 4); // initialize at 0
    this.velocityBuffer = this.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });
    this.device.queue.writeBuffer(this.velocityBuffer, 0, velocities);
    
    // 4. Uniform Buffers
    // Compute Uniform: Header parameters + 101 agents array = 1648 bytes
    this.computeUniformBuffer = this.device.createBuffer({
      size: 1648, // 8 floats header + 101 * 4 floats = 412 floats = 1648 bytes
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    
    // Render Uniform: mat4x4 viewProj (64 bytes) + vec3 color (12 bytes) + 1 float zoom (4 bytes) + vec2 lightPos (8 bytes) + vec2 padding (8 bytes) = 96 bytes
    this.renderUniformBuffer = this.device.createBuffer({
      size: 96,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    
    // Create Bind Groups
    this.computeBindGroup = this.device.createBindGroup({
      layout: this.computePipeline!.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.computeUniformBuffer } },
        { binding: 1, resource: { buffer: this.originalBuffer } },
        { binding: 2, resource: { buffer: this.currentBuffer } },
        { binding: 3, resource: { buffer: this.velocityBuffer } }
      ]
    });
    
    this.renderBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline!.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.renderUniformBuffer } },
        { binding: 1, resource: { buffer: this.currentBuffer } },
        { binding: 2, resource: { buffer: this.velocityBuffer } }
      ]
    });
  }
  
  public runComputePass(
    time: number,
    force: number,
    elasticity: number,
    damping: number,
    heatRate: number,
    zoom: number,
    agentsList: Array<{ x: number; y: number; isDrawing: boolean }>
  ) {
    if (!this.device || !this.computePipeline || !this.computeBindGroup || !this.computeUniformBuffer) return;
    
    const limit = Math.min(agentsList.length, 101);
    
    // Header data: 8 floats = 32 bytes
    const headerData = [
      time,
      force,
      elasticity,
      damping,
      heatRate,
      zoom,
      limit, // agentCount
      0.0    // padding
    ];
    
    // Compiling full array: 412 floats = 1648 bytes
    const uniformData = new Float32Array(412);
    uniformData.set(headerData, 0);
    
    // Map each agent data: 4 floats per agent (16 bytes)
    for (let i = 0; i < limit; i++) {
      const startIdx = 8 + i * 4;
      const agent = agentsList[i];
      uniformData[startIdx] = agent.x;
      uniformData[startIdx + 1] = agent.y;
      uniformData[startIdx + 2] = agent.isDrawing ? 1.0 : 0.0;
      uniformData[startIdx + 3] = 0.0; // padding
    }
    
    this.device.queue.writeBuffer(this.computeUniformBuffer, 0, uniformData);
    
    // Dispatch
    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.computePipeline);
    passEncoder.setBindGroup(0, this.computeBindGroup);
    
    const workgroups = Math.ceil(this.count / 64);
    passEncoder.dispatchWorkgroups(workgroups);
    passEncoder.end();
    
    this.device.queue.submit([commandEncoder.finish()]);
  }
  
  public render(
    context: GPUCanvasContext,
    viewProjectionMatrix: Float32Array,
    rgbColor: number[], // [r, g, b] normalized 0-1
    zoom: number,
    lightX: number,
    lightY: number
  ) {
    if (!this.device || !this.renderPipeline || !this.renderBindGroup || !this.renderUniformBuffer) return;
    
    // Write Render Uniforms
    const renderUniformData = new Float32Array(24); // 96 bytes / 4 = 24 floats
    renderUniformData.set(viewProjectionMatrix, 0); // 16 floats
    renderUniformData.set(rgbColor, 16);           // 3 floats
    renderUniformData[19] = zoom;                  // 1 float
    renderUniformData[20] = lightX;                // 1 float
    renderUniformData[21] = lightY;                // 1 float
    renderUniformData[22] = 0.0;                   // padding
    renderUniformData[23] = 0.0;                   // padding
    this.device.queue.writeBuffer(this.renderUniformBuffer, 0, renderUniformData);
    
    const commandEncoder = this.device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.04, g: 0.04, b: 0.04, a: 1.0 }, // Noir 900 background
        loadOp: "clear",
        storeOp: "store"
      }]
    };
    
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(this.renderPipeline);
    passEncoder.setBindGroup(0, this.renderBindGroup);
    passEncoder.draw(this.count);
    passEncoder.end();
    
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
