precision highp float;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uTurbulence;
uniform float uBrightness;
varying vec2 vUv;

// Rotation matrix
mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

// Better noise: Hash function for FBM
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Value noise with smooth interpolation
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

// Fractional Brownian Motion (FBM)
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot(0.5) * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

// Domain Warping for liquid effect
float pattern(vec2 p, out vec2 q, out vec2 r) {
    q = vec2(fbm(p + vec2(0.0, 0.0)), fbm(p + vec2(5.2, 1.3)));
    r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + uTime * 0.1), fbm(p + 4.0 * q + vec2(8.3, 2.8) + uTime * 0.126));
    return fbm(p + 4.0 * r);
}

void main() {
    vec2 p = vUv * 3.0;
    vec2 q, r;
    float f = pattern(p, q, r);
    
    // SECONDARY LAYER (Ghost layer for depth)
    vec2 q2, r2;
    float f_ghost = pattern(p * 0.5 + uTime * 0.05, q2, r2);
    
    // Base color mixing with domain warping results
    vec3 color = mix(uColorA, uColorB, clamp(f * f * 4.0, 0.0, 1.0));
    color = mix(color, uColorC, clamp(length(q), 0.0, 1.0));
    color = mix(color, uColorD, clamp(length(r.x), 0.0, 1.0));
    
    // Blend in the ghost layer
    color = mix(color, uColorA, f_ghost * 0.15);
    
    // Add a "sheen" or specular highlight
    float sheen = pow(1.0 - f, 3.0);
    color += sheen * 0.1 * uColorA;
    
    // Subtle chromatic aberration effect in the noise
    float f2 = pattern(p + 0.01, q, r);
    color.r = mix(color.r, uColorC.r, clamp(f2 - f, 0.0, 1.0) * 2.0);
    
    // Soft vignette
    float dist = length(vUv - 0.5);
    color *= smoothstep(1.2, 0.2, dist);
    
    // Apply brightness (for the bump)
    color *= uBrightness;
    
    gl_FragColor = vec4(color, 1.0);
}
