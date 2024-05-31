import { Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Pathfinding, PathfindingHelper } from 'three-pathfinding'
import Character from '../Elements/Character'
import { CSG } from 'three-csg-ts'

import Global from '../Elements/Global'
const global = Global.getInstance()

export default class PathFinder {

    ready: boolean
    pathfinding: Pathfinding
    helper: PathfindingHelper


    constructor () {
        this.ready = false

        this.pathfinding = new Pathfinding()
        this.helper = new PathfindingHelper()
    }
    

    find (a: Vector3, b: Vector3, obstacles?: Array<Character>) {
        return new Promise<Array<Vector3>>((resolve, reject) => {
            try {
                let navmesh = global.navmesh.clone()
        
                if (obstacles && obstacles.length) {
                    for (const item of obstacles) {
                        const collision = item.collision.clone()
                
                        collision.position.copy(item.main.position)
                        collision.applyQuaternion(item.main.quaternion)
                        collision.scale.set(item.scale, item.scale, item.scale)
                        collision.material = new MeshBasicMaterial({
                            color: '#ff0000'
                        })
                
                        collision.updateMatrix()
                
                        navmesh = CSG.subtract(navmesh, collision)
            
                    }
                }
        
                const ZONE = 'level'
                
                this.pathfinding.setZoneData(ZONE, Pathfinding.createZone(navmesh.geometry))
                
                const groupId = this.pathfinding.getGroup(ZONE, a)
                // const groupIdB = this.pathfinding.getGroup(ZONE, b)
                const clostA = this.pathfinding.getClosestNode(a, ZONE, groupId)
                const clostB = this.pathfinding.getClosestNode(b, ZONE, groupId)
        
        
                const path = this.pathfinding.findPath(clostA.centroid, clostB.centroid, ZONE, groupId)
                
        
                // this.helper.reset()
                // this.helper.setPlayerPosition(a)
                // this.helper.setTargetPosition(b)
                // this.helper.setPath(path)
        
                resolve(path)

            } catch (err) {
                reject(err)
            }

        })
    }
}