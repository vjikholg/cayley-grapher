// TODO: add sidebar to generate groups
// TODO: get generators NODES to be the same color as their edges
// TODO: modify nodes to properly display matrices, group elements, id, etc., provide traversal formula on how this element was obtained in runtime
// TODO: maybe "slow down" generation - show step by step of how group is generated, populated, etc. GENERATE GRAPH DURING MAKEGROUP would be really cool 


import { CayleyGraph } from "./modules/cayleygraph.js"; 
import { FiniteGroup } from "./modules/structs/finitegroup.js";
import { Matrix }    from "./modules/structs/matrix.js";
// import allGroups from './data/output.json' assert {type: 'json'};

const allGroups = await fetch('./data/output.json').then(res => res.json());

const groupData = allGroups.find(x => x.name === "c3xdic5"); 

const mtc = groupData.generators.map((mtx) => {
    const temp = new Matrix(groupData.glforder, mtx.length); 
    temp.contents = mtx; 
    return temp;
})

const group = new FiniteGroup(mtc, groupData.name); 

let currentGraph = new CayleyGraph(group, '3d-graph'); 

const sel = document.getElementById('group-select');

allGroups.forEach((g,i) => {
    const opt = document.createElement('option');
    opt.value = i; 
    opt.innerHTML = g.name; 
    sel.appendChild(opt); 
}); 

sel.value = "41"

sel.addEventListener('change', (e) => {
    const idx = parseInt(sel.value);
    const groupData = allGroups[idx]; 

    const mtc = groupData.generators.map((mtx) => {
    const temp = new Matrix(groupData.glforder, mtx.length); 
    temp.contents = mtx; 
    return temp;
    }); 

    const group = new FiniteGroup(mtc, groupData.name);
    currentGraph.update(group);

});

sel.dispatchEvent(new Event('change'));



