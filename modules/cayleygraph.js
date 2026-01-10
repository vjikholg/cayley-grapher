import { FiniteGroup } from './structs/finitegroup.js';
import { Matrix } from './structs/matrix.js'; // 

export const MATRIX_BY_ID = { 
    map : new Map(),
    get(id) {
        return this.map.get(id)
    }, 

    set(id, mtx) {
        this.map.set(id, mtx);
    },

    clear() {
        this.map.clear();
    }
}; 

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

    constructor(group, canvas) {
        this.graph = canvas;
        this.update(group);
    }


    update(group) {
        MATRIX_BY_ID.clear(); 
        const palette = getGeneratorPalette(group.generators.length, {s: 80, l: 45});
        const key2idx = new Map();
        let nodes = []; 
            // caching elements so we can map from key -> element id. 
        // building node list while we're at it
        for (const [i, el] of group.elems.entries()) {
            nodes.push({id: i, label: el.key, value: 4}) // value -> size of node
            MATRIX_BY_ID.set(i, el.contents);
            key2idx.set(el.key, i);
        }
        
        // building link list
        // for each element, mult elem with generator, check target 
        let links = []; 

        for (const g of group.elems) {
            for (let h of group.generators) { // group generators kept as int indixes in
                let temp = g.mult(group.elems.get(h)); 
                links.push({
                    source: key2idx.get(g.key), 
                    target: key2idx.get(temp.key), 
                    gen: h
                })
            }
        }

        this.graph.graphData({nodes,links})
            .linkColor(link => palette[link.gen])
            .linkOpacity(1)
    }
}

/**
 * getGeneratorPalette(n [, opts])
 * --------------------------------
 * Evenly distributes n colours around the hue wheel using the
 * golden-ratio step so successive hues are as far apart as possible.
 *
 * @param {number} n              – how many colours you need
 * @param {Object} [opts]         – optional tuning
 *        {number} opts.s  (0-100) – saturation   (default 65)
 *        {number} opts.l  (0-100) – lightness    (default 55)
 *        {number} opts.h0 (0-360) – starting hue (default random)
 *
 * @returns {string[]} array of `#rrggbb` strings length = n
 *
 * Examples
 * --------
 * const palette = getGeneratorPalette(4);      // 4 distinct colours
 * const pastel  = getGeneratorPalette(6, {s:50,l:70});
 */

export function getGeneratorPalette(n, opts = {}) {
    const { s = 65, l = 55, h0 = Math.random() * 360 } = opts;
    const phi = 360 * 0.61803398875;   // golden-ratio step in degrees
    const toHex = c =>
        ('0' + Math.round(c).toString(16)).slice(-2);   // convert 0-255 → "00"-"ff"
    
    const colours = [];
    let hue = h0;

    for (let i = 0; i < n; i++) {
        // HSL → RGB (simple formula, no library needed)
        const h = (hue % 360) / 360;
        const sat = s / 100, light = l / 100;

        const a = sat * Math.min(light, 1 - light);
        const f = t => {
            const k = (t + h) % 1;
            return light - a * Math.max(Math.min(k * 6, 4 - k * 6, 1), -1);
        };

        const [r, g, b] = [f(1 / 3), f(0), f(2 / 3)].map(v => v * 255);
        colours.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`);

        hue += phi;          // next hue around the wheel
    }
    return colours;
}

