precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform float uPlaygroundMode;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uTurbulence;
uniform float uBrightness;
varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

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

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) {
        v += a * noise(p);
        p = p * 2.1 + vec2(1.5);
        a *= 0.5;
    }
    return v;
}

float fbm_high(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = p * 2.2 + vec2(1.7, 9.2);
        a *= 0.5;
    }
    return v;
}

// Elegant iridescence
vec3 iridescence(float t) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 p = vUv * 1.5;
    float t = uTime * 0.1;
    
    float mouseDist = length(vUv - uMouse);
    float mouseInfluence = smoothstep(0.9, 0.0, mouseDist);
    
    // OPTIMIZATION: Calculate core displacement once
    float power = 1.0 + uPlaygroundMode * 6.0;
    vec2 offset = (vUv - uMouse) * mouseInfluence * 1.5 * power;
    
    vec2 p_core = p - offset;
    vec2 q = vec2(fbm(p_core + t * 0.4), fbm(p_core + vec2(1.2) - t * 0.3));
    vec2 r = vec2(fbm(p_core + 3.0 * q + vec2(1.7, 9.2) + t * 0.25), fbm(p_core + 3.0 * q + vec2(8.3, 2.8) + t * 0.15));
    
    // Use high quality only when needed and once
    float f = (uPlaygroundMode > 0.5) ? fbm_high(p_core + 4.5 * r) : fbm(p_core + 4.0 * r);

    // ELEGANCE: Chromatic aberration as a post-process effect within the shader
    float shift = 0.01 * mouseInfluence * (1.0 + uPlaygroundMode * 2.0);
    float f_r = (uPlaygroundMode > 0.5) ? fbm_high(p_core + 4.5 * r + shift) : fbm(p_core + 4.0 * r + shift);
    float f_b = (uPlaygroundMode > 0.5) ? fbm_high(p_core + 4.5 * r - shift) : fbm(p_core + 4.0 * r - shift);

    // Ink mixing
    vec3 borrowedA = mix(uColorA, uColorB, vUv.x);
    vec3 borrowedB = mix(uColorC, uColorD, vUv.y);
    vec3 envColor = mix(borrowedA, borrowedB, length(r) * 0.5);
    
    vec3 baseCol = mix(uColorA, uColorB, clamp(f * f * 4.0, 0.0, 1.0));
    baseCol = mix(baseCol, uColorC, clamp(length(q), 0.0, 1.0));
    baseCol = mix(baseCol, envColor, clamp(length(r) * 0.5, 0.0, 1.0));
    
    // Elegant oil-slick shimmer
    vec3 iris = iridescence(f * 2.0 + length(q) * 0.5 + t);
    baseCol = mix(baseCol, iris, uPlaygroundMode * 0.15 * mouseInfluence);

    // Apply RGB shift
    vec3 finalColor = vec3(
        mix(uColorA.r, baseCol.r, f_r),
        baseCol.g,
        mix(uColorD.b, baseCol.b, f_b)
    );
    
    // Roaming highlight
    float highlight = smoothstep(0.4, 0.0, length(q - 0.5));
    finalColor += highlight * 0.04 * uBrightness;
    
    // Vignette
    float d = length(vUv - 0.5);
    finalColor *= smoothstep(1.6, 0.3, d);
    
    float intensity = uBrightness * (1.0 + f * uTurbulence);
    gl_FragColor = vec4(finalColor * intensity, 1.0);
}
