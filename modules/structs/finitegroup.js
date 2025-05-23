import { Matrix } from "./matrix.js";
import { indexedSet } from "./indexedset.js";

export class FiniteGroup {
    /**
     * Represents a finite group. Uses matrices over GL(p^k) or integers over Z/nZ as elements.  
     * @constructor
     * @param {Array} generators matrix(ces) over GLFs  
     * @param {Number} n order of the GLF
     */
    constructor(generator, name) { 
        this.name = name; 
        this.elems = new indexedSet()
        this.elems.set(generator); 
        
        // keeps initial length of elems - keep index of generators rather than generators themselves
        this.generators = [];
        for (let i = 0; i < generator.length; i++) {
            this.generators.push(i); 
        }

        this.makeGroup(); 
        this.order = this.elems.size; 
    }

    makeGroup() {                              // large G -> use shreier sims
        let i = 0; 
        while (i < this.elems.size) {        // want this to dynamically update at the start of each loop
            let curr = this.elems.get(i); 
            // console.log(curr); 

            this.elems.forEach( (g) => {    
                // console.log("processing: " + curr.contents + " and " + g.contents); 
                let newElem = curr.mult(g); 
                // console.log(newElem);
                if (!this.contains(newElem)) {
                    // console.log("we dont have: " + g.contents + ", pushing...");
                    this.elems.add(newElem);
                } 
            })
            i++; 
        }
    }

    contains(g) {
        // console.log("checking if: :" + g.contents + " is contained in group: " + this.name); 
        return this.elems.has(g); 
    }



    /**
     * "Algorithm 4" - Lemma 3 tells us satisfying certain conditions, orbit of an 
     * element under conjugation by is equivalent to orbit of the element by the group's generators. 
     * 
     * @param {Array} generators - Array of generators that would otherwise generate an entire group 
     * @param {Matrix, number} w - positive integer over a finite field 
     * @returns an array delta representing the orbit of w under conjugation
     * Remark 1: - |generators| = 1 tells us G is cyclic -> abelian, conjugation is equiv. to identity map in abelian groups
     * and so orbitConj(generators, w) would return {w}. 
     * 
     * Remark 2: 
     */ 

    static orbitConj(generators, w) {
        let delta = [w]; 
        for (let d of delta) {
            for (let g of generators) {
                let gamma = conjugate(d,g); 
                if (!delta.includes(gamma)) {
                    delta.push(gamma);   
                } 
            }
        }
        return delta; 
    }

    /**
     * "Algorithm 4.1" - Orbit algorithm by right multiplication 
     * One of the consequences of the generalized orbit algorithm is we can then find all group elements g in G 
     * through the orbit of 1_G under right multiplication by G. Crude, but for SMALL groups (|G| < 1000) it's fine. 
     * 
     * 
     * @param {Array} generators - Array of generators that would otherwise generate an entire group 
     * @param {Matrix, number} w - positive integer over a finite field 
     * @returns orbit of w under G-action by right multiplication 
     */
    static orbitRight(generators, w) { 
        let delta = [w]; // not too large so we can use an array instead of an indexed set 
        for (let d of delta) {
            for (let g of generators) {
                let gamma = d.mult(g);  
                if (!delta.includes(gamma)) {
                    delta.push(gamma);   
                } 
            }
        }
        return delta; 
    }

    /**
     * "Algorithm 9" - Orbit Algorithm with transversal 
     * Assume the group action is by right multiplication. 
     * Goal: modify our orbit algorithm such that we're tracking 
     * 
     * 
     * @param {Group} group - a group, either a matrix group or the multiplicative group from a finite field
     * @param {Matrix, number} w - positive integer over a finite field 
     */

    static transversal(generators, w) { 
    let delta = [w];
    let id = Matrix.identity(generators[0].rows, generator[0].glf.order); 
    let transversal = [id];
    let i = 0; 
    for (let d of delta) {
        for (let g of generators) {
            let gamma = g.mult(d);
            if (!delta.includes(gamma)) { 
                delta.push(gamma); 
                transversal.push( T[delta.indexOf(d)].mult(g) ); // "append" T[d] * g_i to T
            }                                                    // the goal of this is to keep track of the path    
        }
        i++;
    }
    return {w,transversal};
    }
}

/** 
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * assertClosed goes through the entire group to check that its multiplicatively closed (since we're using matrix mult.)
 * 
 */ 
export function assertClosed(group){ 
    for(let g of group.elems) {
        for (let h of group.elems) {
            let temp = g.mult(h); 
            if(!group.elems.has(temp)) {
                console.log("g: " + g.contents + "h: " + h.contents + " do not exist!");
                return false; 
            }
        }
    }
    return true; 
}

/**
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * assertInverse goes through the entire group and ensures 
 */
export function assertInverse(group) { // yeah this is legit O(|G|^2) garbage fixed using indexed set though
    for (let g of group.elems) { 
        let temp = g.invert(); 
        if (!group.contains(temp)) { // indexed set takes this from O(|G|) -> O(1) lookup  
            console.log("group does not contain inverse of g: " + g.contents + ", " + temp.contents);
            return false; 
        }
    }
    return true; 
}

/**
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * assert Identity ensures that we have an identity element in the group, i.e., I_n over GL(k) or similar 
 */
export function assertIdentityExist(group) { 
    const id = Matrix.identity(group.elems.get(0).glf.order, group.elems.get(0).rows); // yet another garbage line but whatever
    return (group.contains(id));
}

/**
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * wrapper for group axiom assertions
 */

export function assertGroup(group) {
    return assertInverse(group) && assertIdentityExist(group) && assertClosed(group); 
    // associativity trivial given rep. by matrix, so dont need to check
}