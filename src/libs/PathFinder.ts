import { Mesh, Vector3 } from 'three'

import { Crowd, init as initRecastNavigation, NavMesh, NavMeshQuery } from '@recast-navigation/core'

import { generateSoloNavMesh } from '@recast-navigation/generators'


export default class PathFinder {
    ready: boolean
    
    navMesh: NavMesh | null
    query: NavMeshQuery | null

    crowd: Crowd | null

    working: boolean

    constructor () {
        this.ready = false

        this.navMesh = null
        this.query = null
        this.crowd = null

    }

    async init (mesh: Mesh) {
        await initRecastNavigation()

        // const [positions, indices] = getPositionsAndIndices([mesh])
        // console.log(mesh.geometry)
        const positions = mesh.geometry.attributes.position.array
        const indices = mesh.geometry.index?.array
        if (!positions || ! indices) return
        const { success, navMesh} = generateSoloNavMesh(positions, indices)

        
        
        if (!success) {
            return
        }

        this.navMesh = navMesh
        this.query = new NavMeshQuery(navMesh)
        this.crowd = new Crowd(navMesh, { maxAgents: 20, maxAgentRadius: 1 })
        
        this.ready = true
    }
    

    find (a: Vector3, b: Vector3) {
        if (!this.query)  return
        
        const { path } = this.query.computePath(a, b)
        return path
    }

}