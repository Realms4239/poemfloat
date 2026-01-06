varying vec2 vUv;
varying float vProgress;
uniform float uProgress;
uniform float uTime;

void main() {
  vUv = uv;
  vProgress = uProgress;
  
  vec3 pos = position;
  
  // Subtle wobble
  float wobble = sin(pos.z * 2.0 + uTime * 3.0) * 0.05;
  pos.xy += wobble;
  
  // Taper ends
  float taper = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
