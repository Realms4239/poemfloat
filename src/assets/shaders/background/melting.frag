precision highp float;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uTurbulence;
uniform float uBrightness;
varying vec2 vUv;

// Simplified hash for performance
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Simple value noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Simplified FBM with only 3 octaves for mobile performance
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) {
        v += a * noise(p);
        p = p * 2.0 + vec2(10.0);
        a *= 0.5;
    }
    return v;
}

void main() {
    // "Roaming ink" effect using domain warping with reduced complexity
    vec2 p = vUv * 2.0;
    float t = uTime * 0.15;
    
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.5), fbm(p + 3.0 * q + vec2(8.3, 2.8) + t * 0.3));
    float f = fbm(p + 3.0 * r);
    
    // Smooth ink-like color mixing
    vec3 color = mix(uColorA, uColorB, clamp(f * f * 3.0, 0.0, 1.0));
    color = mix(color, uColorC, clamp(length(q), 0.0, 1.0));
    color = mix(color, uColorD, clamp(length(r.x), 0.0, 1.0));
    
    // Add subtle depth
    color += (f * 0.05);
    
    // Soft vignette
    float dist = length(vUv - 0.5);
    color *= smoothstep(1.3, 0.4, dist);
    
    // Apply brightness and turbulence scaling
    color *= uBrightness + (f * uTurbulence * 0.5);
    
    gl_FragColor = vec4(color, 1.0);
}
