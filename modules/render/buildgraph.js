import { CayleyGraph } from "../cayleygraph.js"; 
import { FiniteGroup } from "../structs/finitegroup.js";
import { Matrix }    from "../structs/matrix.js";

/**
 * Handles canvas initialization logic
 */

export function initializeGraph(_domID) { 
    let currentGraph = ForceGraph3D()(document.getElementById(_domID))
        .nodeId('id')
        .nodeLabel('label')
        .nodeVal('value')
        .linkDirectionalArrowLength(5.5)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalParticles(1)
        .linkDirectionalParticleWidth(1.4)
        .linkDirectionalParticleSpeed(0.003)
        .nodeRelSize([1]) 
    // d3 link force setting 
    currentGraph.d3Force('link')
        .distance(link => 30); 

    return currentGraph; 
}