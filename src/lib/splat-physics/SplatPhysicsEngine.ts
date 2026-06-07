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

export const PHYSICS_COMPUTE_SHADER = `
struct PhysicsUniforms {
  mousePos: vec2<f32>,
  time: f32,
  force: f32,
  elasticity: f32,
  damping: f32,
}

@group(0) @binding(0) var<uniform> uniforms: PhysicsUniforms;
@group(0) @binding(1) var<storage, read> originalPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> currentPos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec4<f32>>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  // Guard check against array boundaries
  if (idx >= arrayLength(&originalPos)) {
    return;
  }

  let orig = originalPos[idx].xyz;
  var pos = currentPos[idx].xyz;
  var vel = velocities[idx].xyz;

  // 1. Spring force (elastic return)
  let springVector = orig - pos;
  let springForce = springVector * uniforms.elasticity;

  // 2. Cursor interaction (repulsion)
  let distVec = pos.xy - uniforms.mousePos;
  let dist = length(distVec);
  
  var repulsion = vec3<f32>(0.0);
  if (dist < 0.6) {
    let strength = (0.6 - dist) * uniforms.force;
    // Push away in XY, and bump out in Z
    repulsion = vec3<f32>(normalize(distVec) * strength * 0.8, strength * 1.5);
  }

  // 3. Physics integration
  let accel = springForce + repulsion;
  vel = (vel + accel) * uniforms.damping;
  pos = pos + vel;

  // Store state back
  currentPos[idx] = vec4<f32>(pos, originalPos[idx].w); // preserve w component (could be size/alpha)
  velocities[idx] = vec4<f32>(vel, 0.0);
}
`;

export const RENDER_SHADER = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) size: f32,
};

struct RenderUniforms {
  viewProjection: mat4x4<f32>,
  primaryColor: vec3<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: RenderUniforms;
@group(0) @binding(1) var<storage, read> positions: array<vec4<f32>>;

@vertex
fn vs_main(@builtin(vertex_index) vertex_idx: u32) -> VertexOutput {
  var out: VertexOutput;
  let pos = positions[vertex_idx].xyz;
  
  // Projection
  out.position = uniforms.viewProjection * vec4<f32>(pos, 1.0);
  out.color = uniforms.primaryColor * (0.6 + 0.4 * sin(pos.z * 5.0));
  out.size = 3.0; // point size
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
      console.warn("WebGPU not supported on this browser.");
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
    // Compute Uniform: vec2 mousePos, float time, float force, float elasticity, float damping (aligned to 16 bytes chunks)
    this.computeUniformBuffer = this.device.createBuffer({
      size: 32, // 8 floats = 32 bytes
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    
    // Render Uniform: mat4x4 viewProj (64 bytes) + vec3 color (12 bytes) + 4 bytes padding = 80 bytes
    this.renderUniformBuffer = this.device.createBuffer({
      size: 80,
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
        { binding: 1, resource: { buffer: this.currentBuffer } }
      ]
    });
  }
  
  public runComputePass(
    mouseX: number,
    mouseY: number,
    time: number,
    force: number,
    elasticity: number,
    damping: number
  ) {
    if (!this.device || !this.computePipeline || !this.computeBindGroup || !this.computeUniformBuffer) return;
    
    // Write Uniforms
    const uniformData = new Float32Array([
      mouseX, mouseY,
      time,
      force,
      elasticity,
      damping,
      0, 0 // padding
    ]);
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
    rgbColor: number[] // [r, g, b] normalized 0-1
  ) {
    if (!this.device || !this.renderPipeline || !this.renderBindGroup || !this.renderUniformBuffer) return;
    
    // Write Render Uniforms
    const renderUniformData = new Float32Array(20); // 80 bytes / 4 = 20 floats
    renderUniformData.set(viewProjectionMatrix, 0); // 16 floats mat4x4
    renderUniformData.set(rgbColor, 16); // 3 floats vec3
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
