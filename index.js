import CayleyGraph from "./modules/cayleygraph"; 
const allGroups = require("./data/output.json"); 

const c2xq8 = allGroups.find(x => x.name === "c2xq8"); 

const mtc = d4.generators.map((mtx) => {
    const temp = new Matrix(d4.glforder, mtx.length); 
    temp.contents = mtx; 
    return temp;
})

const group = new FiniteGroup(mtc, c2xq8.name); 

const Graph = new CayleyGraph(group, '3d-graph')