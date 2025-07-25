// TODO: add sidebar to generate groups
// TODO: get generators NODES to be the same color as their edges
// TODO: modify nodes to properly display matrices, group elements, id, etc., provide traversal formula on how this element was obtained in runtime
// TODO: maybe "slow down" generation - show step by step of how group is generated, populated, etc. GENERATE GRAPH DURING MAKEGROUP would be really cool 

// math lib
import { CayleyGraph } from "./modules/cayleygraph.js"; 
import { FiniteGroup } from "./modules/structs/finitegroup.js";
import { Matrix }    from "./modules/structs/matrix.js";

// web dev comps
import { initializeGraph } from "./modules/render/buildgraph.js";
import { allGroups } from "./modules/render/grouplist.js";
import { initializeSettings, updateSettings, depopulateSettings} from "./modules/render/settingsbox.js";
import { BUS } from "./modules/render/bus.js";
import { initializeDropdown } from "./modules/render/dropdown.js";

/**
 * Handles default group generation and canvas implementation - to tweak settings check cayleygraph.js
 */


const INIT_GROUP_VAL = "41"; // cross between c2, q8 

let group = allGroups.getByIndex(INIT_GROUP_VAL);
let canvas = initializeGraph('3d-graph'); 
let currentGraph = new CayleyGraph(group, canvas); 
// *** DEFAULT GROUP + CANVAS GENERATION END ***


// Populates a dropdown list of available groups to render 

// initializeDropdown(INIT_GROUP_VAL); 
initializeDropdown(); 
initializeSettings(group.generators); 


// changing-groups
BUS.addEventListener('group-change', e => {
    const group = e.detail; 
    // console.log(group);
    currentGraph.update(group); 
    depopulateSettings();
    updateSettings(group.generators); 
})

// changing-settings
BUS.addEventListener('settings-changed', e => {
    // console.log("received setting change!")
    const activeLinks = e.detail; 
    currentGraph.graph.linkVisibility(link => activeLinks.has(link.gen));
})

document.addEventListener('resize', (e) => {
    console.log(e)
})