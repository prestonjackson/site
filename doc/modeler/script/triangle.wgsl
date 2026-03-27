@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4f {
  let x = f32(i32(in_vertex_index) - 1) * 0.5;
  let y = f32((in_vertex_index & 1u) ^ 1u) * -0.5;
  return vec4f(x, y, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4f {
  return vec4f(0.2, 0.8, 0.4, 1.0);
}
