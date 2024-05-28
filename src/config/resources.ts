import { LoaderType } from '../utils/Loader'


const rootPath = import.meta.env.VITE_SUB_DOMAIN || ''

export default [
    { name: 'texture-scene', type: LoaderType.Texture, path: rootPath + 'textures/scene.png'},
    { name: 'model-scene', type: LoaderType.GLTF, path: rootPath + 'models/scene.glb'},

    { name: 'texture-kight', type: LoaderType.Texture, path: rootPath + 'textures/knight.png'},
    { name: 'model-knight', type: LoaderType.GLTF, path: rootPath + 'models/knight.glb'},


    { name: 'texture-skeleton', type: LoaderType.Texture, path: rootPath + 'textures/skeleton.png'},
    { name: 'model-skeleton', type: LoaderType.GLTF, path: rootPath + 'models/skeleton.glb'},
    // { name: 'texture-player', type: LoaderType.Texture, path: rootPath + 'textures/player.webp'},

]