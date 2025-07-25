import { MATRIX_BY_ID } from "../cayleygraph.js"; 
import { svgLoad } from "./matrixsprite.js";
import { SVGRenderer, SVGObject } from "three/examples/jsm/Addons.js";

import * as three from 'three'; 

const RADIUS = 6; 
const _vStart = new three.Vector3();
const _vEnd   = new three.Vector3();
const _dir    = new three.Vector3();
const shortenFactor = (rSrc, rTgt, dist) => (dist - (rSrc + rTgt)) / dist;
let  UPDATE = true; 

/**
 * Handles canvas initialization logic
 */

export function initializeGraph(_domID) { 
    let graph = ForceGraph3D()
    (document.getElementById(_domID))
        // .nodeId('id')
        // .nodeLabel('label')
        // .nodeVal('value')
        .nodeThreeObject(node => svgLoad(MATRIX_BY_ID.get(node.id)))
        .nodeOpacity(0)
        .nodeThreeObjectExtend(true)
        // .nodeVisibility(() => false)
        .linkThreeObjectExtend(false) 
        .linkPositionUpdate((obj, { start, end }, link) => cropLinkLength(obj, {start, end}, link))     // see below
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowLength(2)
        .linkDirectionalParticles(1)
        .linkDirectionalParticleWidth(0.25)
        .linkDirectionalParticleSpeed(0.003)
        .nodeRelSize(RADIUS) 
        .backgroundColor("#404040")	
        .cooldownTicks(100)



    // d3 link force setting 
    graph.d3Force('link').distance(link => 30); 

    // zoom setting post-generation, run once
    // graph.onEngineStop(() => {
    //     if (UPDATE) {
    //         graph.zoomToFit(1000, 0, node => true)
    //         UPDATE = false; 
    //     }
    // 
    // })


    return graph; 
}


/**
 * 
 * @param {*} obj 
 * @param {*} param1 
 * @param {*} link 
 * @returns 
 */
function cropLinkLength(obj, {start, end}, link) {
    if (!obj.isLine) return;
    // cached start, endpoints
    _vStart.copy(start);
    _vEnd.copy(end);
    _dir.subVectors(_vEnd, _vStart).normalize();

    // from radius of src, tgt, compute our "padding" - where link ends
    const rSrc = link.source.r ?? RADIUS;
    const rTgt = link.target.r ?? RADIUS;

    // scales this 
    _vStart.addScaledVector(_dir, rSrc);
    _vEnd.addScaledVector(_dir, -rTgt);

    // update our line geometry
    const posArr = obj.geometry.attributes.position.array;
    posArr[0] = _vStart.x; posArr[1] = _vStart.y; posArr[2] = _vStart.z;
    posArr[3] = _vEnd.x;   posArr[4] = _vEnd.y;   posArr[5] = _vEnd.z;

    obj.geometry.attributes.position.needsUpdate = true;
    obj.geometry.computeBoundingSphere();
    return true;
}

/**
 * 
 * @param {*} link 
 */
function cropArrowPosition(link) {
    const d = Math.hypot(
        link.source.x - link.target.x,
        link.source.y - link.target.y,
        link.source.z - link.target.z
    );
    return shortenFactor(RADIUS, RADIUS, d * 0.95);     
}