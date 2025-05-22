import ForceGraph3D from './structs/3d-force-graph'; 
import { FiniteGroup } from './structs/finitegroup';

class CayleyGraph extends ForceGraph3D {
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
    constructor(group, _docId) {
        const key2idx = new Map();
        let nodes = []; 

        // caching elements so we can map from key -> element id. 
        for (let i = 0; i < groups.elems.size; i++) {
            nodes.push({id: i, label: el._key, value: 4})
            let temp = group.elems.get(i); 
            key2idx.set(temp._key, i); 
        }

        let links = []; 

        for (const g of group.elems) {
            for (let h of group.generators) {
                let temp = g.mult(group.elems.get(h)); 
                let target = key2idx.get(temp._key);
                links.push({
                    source: key2idx.get(temp._key), 
                    target: target 
                })
            }
        }
 
    this.graph = ForceGraph3D(document.getElementById(_docId))
    .nodeId('id')
    .nodeLabel('label')
    .nodeVal('value')
    .linkDirectionalParticles(2)
    graphData({
        nodes: nodes, 
        links: links
    })
    
    }
}
