
varying vec2 vUv;
void main() {
    vUv = uv;

    // make bar always face to camera

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
