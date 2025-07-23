import { FiniteGroup } from "../structs/finitegroup.js";
import { Matrix }    from "../structs/matrix.js";

/**
 * Handles group generation, caching already generated groups, with API to quickly grab + generate groups on demand
 */

const dataUrl = new URL('../../data/output_order500.json', import.meta.url); 

export const allGroups = {
    list : await fetch(dataUrl).then(res => res.json()), 
    groups : new Map(),

    getList() {
        return this.list; 
    }, 

    get(name) {
        if (!this.groups.has(name)) {
            const groupData = this.list.find(x => x.name === name); 
            const mtcs = groupData.generators.map((mtx) => {
                const temp = new Matrix(groupData.glforder, mtx.length); 
                temp.contents = mtx; 
                return temp;
            })
            let group = new FiniteGroup(mtcs, name);
            // around here we can add in pruning functionality - if we cache too many groups of > large order, prune list


            this.groups.set(name, group)
            return group; 
        } 
        
        return this.groups.get(name)
    }, 

    getByIndex(idx) {
        const name = this.list[idx].name; 
        return this.get(name);
    }
}

