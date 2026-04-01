struct VertexInput {
  @location(0) position: vec3f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
}

struct Uniforms {
  view: mat4x4f,
  projection: mat4x4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Vertex shader for all geometry types
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  let worldPos = vec4f(input.position, 1.0);
  let viewPos = uniforms.view * worldPos;
  let clipPos = uniforms.projection * viewPos;
  output.position = clipPos;
  output.color = vec3f(0.2, 0.2, 0.2);
  return output;
}

// Fragment shader
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  return vec4f(input.color, 1.0);
}
