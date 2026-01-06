varying vec2 vUv;
uniform float uTime;
uniform float uOpacity;

void main() {
    vec2 p = vUv - 0.5;
    
    // Normalize Y for tapering (from bottom to top of the mesh)
    float y_grad = vUv.y; 
    
    // Dancing curve logic
    float wave = sin(uTime * 1.8 + y_grad * 6.0) * 0.2;
    wave += cos(uTime * 1.2 + y_grad * 10.0) * 0.1;
    
    // Tapering: the tail gets thinner as it goes up
    float taper = smoothstep(1.0, 0.0, y_grad);
    float targetX = wave * taper;
    
    // Distance to the curved path
    float dist = abs(p.x - targetX);
    
    // Glow implementation for a "slender thread" look
    float thickness = 0.002 + 0.01 * taper;
    float glow = 0.004 / (dist + thickness);
    
    // Vertical fade to keep it contained
    glow *= smoothstep(0.0, 0.2, y_grad) * smoothstep(1.0, 0.7, y_grad);
    
    // Moonlight color (silvery blue)
    vec3 moonlight = vec3(0.85, 0.92, 1.0);
    
    // Add a subtle "plaiting" shimmer
    float shimmer = sin(uTime * 4.0 + y_grad * 15.0) * 0.5 + 0.5;
    vec3 finalColor = moonlight * glow * (1.2 + 0.3 * shimmer);
    
    gl_FragColor = vec4(finalColor, glow * uOpacity);
}
