import { Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Pathfinding, PathfindingHelper } from 'three-pathfinding'
import Character from '../Elements/Character'
import { CSG } from 'three-csg-ts'

import Global from '../Elements/Global'
import { init as initRecastNavigation, NavMesh, NavMeshQuery } from 'recast-navigation'
import { getPositionsAndIndices } from '@recast-navigation/three'
import { generateSoloNavMesh } from '@recast-navigation/generators'
const global = Global.getInstance()

export default class PathFinder {


    navMesh: NavMesh | null
    query: NavMeshQuery | null


    constructor () {

        this.navMesh = null
        this.query = null
    }

    async init (mesh: Mesh) {
        console.log('init', 11)
        await initRecastNavigation()

        // const [positions, indices] = getPositionsAndIndices([mesh])
        // console.log(mesh.geometry)
        const positions = mesh.geometry.attributes.position.array
        const indices = mesh.geometry.index?.array
        if (!positions || ! indices) return
        // const cs = 0.05
        // const ch = 0.05
        // const walkableRadius = 0.2
        console.log('2', positions, indices)
        const { success, navMesh} = generateSoloNavMesh(positions, indices, {
            // cs,
            // ch,
            // walkableRadius: Math.round(walkableRadius / ch)
        })
        console.log('3', success, navMesh)
        
        if (!success) {
            return
        }
        console.log('init', positions, indices)
        this.navMesh = navMesh
        this.query = new NavMeshQuery(navMesh)

        console.log('000', this.navMesh)
    }
    

    async find (a: Vector3, b: Vector3, obstacles?: Array<Character>) {
        if (!this.query) return
        const { path } = this.query.computePath(a, b)
        return path
    }
}