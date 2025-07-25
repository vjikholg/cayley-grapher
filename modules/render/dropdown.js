import { initializeSettings, updateSettings } from "./settingsbox.js";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js"; 
import { allGroups } from "./grouplist.js";
import { BUS } from "./bus.js";


const LIST = allGroups.getList(); 
const INPUT = document.getElementById('group-search'); 
const RESULTS = document.getElementById('group-results'); 
const FUSE = new Fuse(LIST, {keys:['name'], threshold:0.3});
const INIT_OPTION_LENGTH = 300; 
let first = true; 

export function initializeDropdown() { 
    INPUT.addEventListener('input', e => { 
        input(e);
    })

    RESULTS.addEventListener('click', e => {
        const li = e.target.closest('li'); 
        if (!li) return; 
        const idx = +li.dataset.idx
        BUS.dispatchEvent(new CustomEvent('group-change', {detail: allGroups.getByIndex(idx) }))
        // RESULTS.innerHTML = ''; 
        INPUT.value = LIST[idx].name;
        RESULTS.style.display = 'none';
    }); 

    document.addEventListener('click', e => {
        if (!RESULTS.contains(e.target)){ 
            RESULTS.style.display = 'none'
        }
        
        if (INPUT.contains(e.target)) {
            console.log(INPUT.value);
            const hits = search(INPUT.value);
            populateResults(hits);
        }
    })
}

function input(e) {
    const query = e.target.value.trim(); 
    const hits = search(query);
    populateResults(hits); 
}

function search(q) {

    const hits = !(q === "")
        ? FUSE.search(q).slice(0,10).map(r => r.item) 
        : getFirstGroups()
    
    return hits; 
}

function populateResults(hits) {
    RESULTS.innerHTML = hits.map( (g) => 
        `<li data-idx="${LIST.indexOf(g)}"> ${g.name} (${g.order}) </li>`).join(''); // this line is so insanely cursed we need to fix it
    RESULTS.style.display = hits.length ? 'block' : "none";                          // O(n) lookup literally for a index zzz
}

function getFirstGroups() {
    let temp = new Array(INIT_OPTION_LENGTH); 
    for (let i = 0; i < temp.length; i++) {
        temp[i] = i; 
    }

    return getListByArr(temp);
}

function getListByArr(arr) {
    let list = arr.map((i) => {
        return LIST[i];
    })
    return list; 
}

// const SELECT = document.getElementById('group-select');

// export function initializeDropdown(defIdx) {
//    const list = allGroups.getList();
// 
//    list.forEach((g,i) => {
//        const opt = document.createElement('option');
//        opt.value = i; 
//        opt.innerHTML = `${g.name} (${g.order})`; 
//        SELECT.appendChild(opt); 
//    });
// 
//    SELECT.value = defIdx;
//    
//    SELECT.addEventListener('change', () => {
//        const idx = parseInt(SELECT.value); 
//        const group = allGroups.getByIndex(idx);
//        BUS.dispatchEvent(new CustomEvent('group-change', {detail: group})); 
//    })
//    return true;
// 
    