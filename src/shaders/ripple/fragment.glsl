uniform float uProgress;
varying vec2 vUv;

void main () {
    vec2 uv = vUv;

    float dist = distance(vUv, vec2(.5));


    float value1 = smoothstep(dist, dist + .1, uProgress * .5);
    float value2 = smoothstep(dist, dist + .1, uProgress * .4);

    float value = value1 - value2;
    value *= .5;

    vec3 color = vec3(1.);
    
    gl_FragColor = vec4(color, value);   
}