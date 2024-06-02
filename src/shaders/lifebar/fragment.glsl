uniform float uLife;
varying vec2 vUv;

void main () {
    vec2 uv = vUv;


    vec3 foreground = mix(vec3(195.0, 33., 43.) / 255., vec3(232., 84., 87.) / 255., vUv.y);
    vec3 background = mix(vec3(8.0, 10., 11.) / 255., vec3(37., 50., 54.) / 255., vUv.y);;

    float progress = step(vUv.x, uLife);

    vec3 color =  mix(background, foreground, progress);
    
    gl_FragColor = vec4(color, 1.);   
}