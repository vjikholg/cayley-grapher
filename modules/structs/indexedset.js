/**
 * While working with finite groups, it came to my attention that I need both a map and a set, 
 * as neither function well enough on their when it comes to array-like accessibility and set-like
 * membership testing.
 */

// import { Matrix } from "../matrix.js";

export class indexedSet {
    /* --------- STORAGE ---------- */  

    #arr = []; 
    #pos = new Map();
    
    /* -------- PUBLIC API -------- */

    has(x) { return this.#pos.has(x.key) }; 

    get(index) { return this.#arr[index] }; 
    
    get size() { return this.#arr.length }; 

    set(arr) { 
        for (let i = 0; i < arr.length; i++) {
            this.add(arr[i]); 
        }
        return this; 
    }

    add(x) {
        const k = x.key;
        if(!this.#pos.has(x.key)) {              
            this.#pos.set(k, this.#arr.length); // set element to index id, fast check to determine membership 
            this.#arr.push(x);                  // push an element, indexed access 
        }
        return this; 
    }

    delete(x) { 
        const i = this.get(x); 
        if (i === undefined) { return false } ; // does not contain
        
        const last = this.#arr.pop();
        if (i < this.size()) {
            this.#arr[i] = last; 
            this.#pos.set(last, i); 
        }
        this.pos.delete(x); 
        return true; 
    }
    
    clear() {
        this.#arr.length = 0; 
        this.#pos.clear(); 
    }


    // --- Iteration Protocol --- // 

    *[Symbol.iterator]() { yield* this.#arr; } //   

    values() {                                 // exposes each stored value in an indexedSet,
        return this[Symbol.iterator]();        // yields each stored value
    }

    *keys() {                                  // yields each index position 0,1,2,...
        for (let i = 0; i < this.#arr.length; i++) yield i; 
    }

    *entries() {                               // yields index-value tuplets like Array.prototype.entries 
        for (let i = 0; i < this.#arr.length; i++) yield [i, this.#arr[i]]; 
    }

    // next, implement forEach 
    forEach(cb, thisArg = undefined) {
        for (let i = 0; i< this.#arr.length; i++) {
            cb.call(this.arg, this.#arr[i], i, this); 
        }
    }

    get [Symbol.toStringTag]() { return 'IndexedSet'; }
}

