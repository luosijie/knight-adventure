import Character from '@/Elements/Character';
import { Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { CSG } from "three-csg-ts";
import { Pathfinding } from "three-pathfinding";

//src/Worker/worker.ts
const workerFunction = function () {
    //we perform every operation we want in this function right here
    self.onmessage = (event: MessageEvent) => {
        const  {origin, target , obstacles, navmesh} = event.data
       
        let basemesh:any = new Mesh(
            navmesh,
            new MeshBasicMaterial()
        )
        console.log(event.data)
        const pathfinding = new Pathfinding()
        
        if (obstacles && obstacles.length) {
            for (const item of obstacles) {
                const collision = new Mesh(
                    item.geometry,
                    new MeshBasicMaterial()
                )
                collision.applyQuaternion(item.quanternion)
                collision.scale.set(item.scale, item.scale, item.scale)
        
                collision.position.copy(item.main.position)
                collision.applyQuaternion(item.main.quaternion)
                collision.scale.set(item.scale, item.scale, item.scale)
                collision.material = new MeshBasicMaterial({
                    color: '#ff0000'
                })
        
                collision.updateMatrix()
        
                basemesh = CSG.subtract(basemesh, collision)
    
            }
        }

        const ZONE = 'level'
        
        pathfinding.setZoneData(ZONE, Pathfinding.createZone(navmesh.geometry))
        
        const groupId = pathfinding.getGroup(ZONE, origin)
        // const groupIdB = pathfinding.getGroup(ZONE, b)
        const clostA = pathfinding.getClosestNode(origin, ZONE, groupId)
        const clostB = pathfinding.getClosestNode(target, ZONE, groupId)


        const path = pathfinding.findPath(clostA.centroid, clostB.centroid, ZONE, groupId)
        
        console.log(event.data);

        postMessage(path);
    };
};

//This stringifies the whole function
let codeToString = workerFunction.toString();
//This brings out the code in the bracket in string
let mainCode = codeToString.substring(codeToString.indexOf('{') + 1, codeToString.lastIndexOf('}'));
//convert the code into a raw data
let blob = new Blob([mainCode], { type: 'application/javascript' });
//A url is made out of the blob object and we're good to go
let worker_script = URL.createObjectURL(blob);


export default class PathWorker {
    worker: Worker
    working: boolean

    callback: Function
    constructor () {
        this.worker = new Worker(worker_script)
        this.working = false

        this.callback = () => {}

        this.worker.onmessage = (ev) => {
            this.callback && this.callback(ev)
        }
    }

    postMessage (origin: Vector3, target: Vector3, collisions: Array<Character>, navmesh: Mesh) {
        if (this.working) return
        this.working = true

        const obstracters = collisions.map(e => ({
            scale: e.scale,
            quanternion: e.main.quaternion.clone(),
            geometry: e.collision.geometry.clone()
        }))
        this.worker.postMessage({
            origin,
            target,
            obstracters,
            navmesh: navmesh.geometry.clone()
        })
    }

    onmessage (fn: Function) {
        this.callback = fn
    }
}