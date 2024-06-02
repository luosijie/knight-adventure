
varying vec2 vUv;
void main() {
    vUv = uv;

    // make bar always face to camera
    mat4 myModelView = modelViewMatrix;
        
    myModelView[0][0] = 1.0;
    myModelView[0][1] = 0.0;
    myModelView[0][2] = 0.0;

    myModelView[1][0] = 0.0;
    myModelView[1][1] = 1.0;
    myModelView[1][2] = 0.0;

    myModelView[2][0] = 0.0;
    myModelView[2][1] = 0.0;
    myModelView[2][2] = 1.0;

    gl_Position = projectionMatrix * myModelView * vec4(position, 1.);
}
