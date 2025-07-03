// import ForceGraph3D from '../modules/vendors/3d-force-graph.min.js'; 



import { FiniteGroup } from './structs/finitegroup.js';
import { Matrix } from './structs/matrix.js';

export class CayleyGraph {
    /** 
     * A Cayley Graph, or Cayley diagram, is a graph that encodes the structure in a Group which is a direct 
     * consequent of Cayley's theorem, stating every graph is isomorphic to a subgroup of its own symmetric group
     * 
     * Given element g in group G, generator s in generating set S (so G = <S> )
     *  - Assign g to a vertex v   
     *  - Assign s to a color c 
     *  
     * Then, for every element g, generator s, corresponding vertex v and color c, there is a directed edge e 
     * with color c from the vertex correspeonding to g -> gs, or v -> v'   
     *  
     * For example, given additive group Z/nZ for integer n, corresponding Cayley graph is a cyclic graph of length n.
     * A fast way to visualize this is 1 -> 2 -> 3 -> ... -> n through the additive operation with generator 1. 
     * 
     * 
     * @param {FiniteGroup} group - a finite group and its elements
     */
    constructor(group, _domId) {
        this.graph = ForceGraph3D()(document.getElementById('3d-graph'))
        .nodeId('id')
        .nodeLabel('label')
        .nodeVal('value')
        .linkDirectionalArrowLength(5.5)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalParticles(2)
        .nodeRelSize([1])
        
            this.update(group);
    }

    update(group) {
        const key2idx = new Map();
        let nodes = []; 
            // caching elements so we can map from key -> element id. 
        // building node list while we're at it
        for (const [i, el] of group.elems.entries()) {
            nodes.push({id: i, label: el.key, value: 4}) // value -> size of node
            key2idx.set(el.key, i);
        }

        // console.log(nodes);
        
        // building link list
        // for each element, mult elem with generator, check target 
        let links = []; 

        for (const g of group.elems) {
            for (let h of group.generators) { // group generators kept as int indixes in
                let temp = g.mult(group.elems.get(h)); 
                links.push({
                    source: key2idx.get(g.key), 
                    target: key2idx.get(temp.key) 
                })
            }
        }

        this.graph.graphData({nodes,links});
    }
}
