import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const svgCache = new Map();
const objCache = new Map(); 


/**
 * 
 * @param {int[][]} arr 2d matrix  
 * @returns Three.Object3D which is a rendered 3d object from SVG 
 */

export function svgLoad(arr) {
    const url = texToSVG(arrayToTex(arr));
    if (objCache.has(url)) {
        return objCache.get(url); 
    }

    return svgTo3dObject(url, obj => {
        if (obj) {
            console.log(obj);
            objCache.set(url, obj)
            return obj;
        }
    }); 
    
}


/**
 * 
 * @param {Integer[][]} arr 2D matrix 
 * @returns 
 */

export function urlGen(arr) {
    return texToSVG(arrayToTex(arr));

}

/**
 * 
 * @param {String} url - base64 URL holding generated SVG file
 * @param {*} done  "finish operation" - what do we do with returned "thing" ? in our context we add it to another generic Object3D and return it to caller 
 */

function svgTo3dObject(url, done) {
    new SVGLoader().load(url, function (data) {
            const group = new THREE.Group(); // group -> object that makes working with object3Ds syntactically clear 
            data.paths.forEach( path =>  {
                const shapes = SVGLoader.createShapes(path); // svg stored as a list of shapes 
                const color = resolveColor(path.color); 

                const material =  new THREE.MeshBasicMaterial( { // define the surface detail - in particular, coloring
                    color: color || 0xffffff, 
                    side: THREE.DoubleSide, 
                    depthWrite: false,
                    transparent: color === null, 
                    opacity: color === null? 0 : 1
                })

                shapes.forEach(shape => {
                    const geom = new THREE.ShapeGeometry(shape); 
                    const mesh = new THREE.Mesh(geom, material); 
                    group.add(mesh); 
                })
            })

            // => next we need to center them at a respective node
            const box = new THREE.Box3().setFromObject(group); 
            const size = new THREE.Vector3(); 
            box.getSize(size); 
            const center = new THREE.Vector3(); 
            box.getCenter(center); 
            group.position.sub(center); 

            // => next, fix scaling
            const targetH = 1; 
            const scale = targetH / size.y; 
            group.scale.setScalar(scale); 

            // => dynamic rotation s.t., it faces the camera at all times 
            group.rotation.x = Math.PI; 
        
            done(group);
        }, 
        // onProgress - ignored 
        undefined, 
        // onError - return err
        err => { 
            console.log('SVG load err', err); 
            done(null);
        }
    )
}

function resolveColor(c, fallback = "0xffffff") { 
    if (!c || c === "currentColor") return fallback; 
    if (c === 'none') return null; 
    
    try {
        return new THREE.Color(c)
    } catch {
        return fallback
    }
}


/**
 * 
 * @param String - tex code to be converted to SVG 
 * @return URL for generated SVG
 * 
 */

function texToSVG(tex) {
    // await MathJax.startup.promise; 
    // console.log(tex);

    if (svgCache.has(tex)) return svgCache.get(tex);

    const svgElem = MathJax.tex2svg(tex, {display: true}).querySelector('svg');
    let svgData = new XMLSerializer().serializeToString(svgElem); 
    svgData = svgData.replace(/currentColor/g, '#000000'); // fixes on-load coloring issue 
    const svg64 = btoa(unescape(encodeURIComponent(svgData))); 
    const url = `data:image/svg+xml;base64,${svg64}`;

    svgCache.set(tex, url);
    
    return url
}


/**
 * 
 * @param {Number[][]} arr
 * @returns {string} latex string
 * @throws {Error} arr not an integer array 
 */

function arrayToTex(mtx) {
    if (!Array.isArray(mtx) || mtx.length === 0) { 
        throw new Error("matrix must be a non-empty 2D array")
    }
    const cols = mtx[0].length; 
    if (!mtx.every(row => Array.isArray(row) && row.length === cols)) {
        throw new Error("matrix must be rectangular!"); 
    }

    const body = mtx   
        .map(row => row.join(' & ')) // each row we add & 
        .join(' \\\\ ');             // new column -> \\\\ for next line

    return `\\begin{bmatrix} ${body} \\end{bmatrix}`
}