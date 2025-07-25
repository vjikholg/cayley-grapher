import { BUS } from "./bus.js";

const FORM = document.getElementById('gen-form');
const ACTIVE = new Set(); 

export function initializeSettings(generators) { 
    updateSettings(generators);
    document.getElementById('settings-toggle').onclick = () =>
        FORM.style.display = FORM.style.display === 'block' ? 'none' : 'block'; 

    FORM.addEventListener('change', e => {
        // console.log("settings changed!")
        const genIdx = parseInt(e.target.dataset.gen); 
        if (e.target.checked) {
            ACTIVE.add(genIdx); 
            // console.log("setting ticked!")
        } else {
            ACTIVE.delete(genIdx);
            // console.log("setting unticked!")
        }
        // console.log(ACTIVE)
        BUS.dispatchEvent(new CustomEvent('settings-changed', {detail: ACTIVE}));
    })
}

export function depopulateSettings() {
    FORM.innerHTML = '';
    ACTIVE.clear(); 
}

export function updateSettings(generators) {
    generators.forEach( (i) => {
        // console.log("update setting fired")
        ACTIVE.add(i); 
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" data-gen="${i}" checked> ${i}`;
        FORM.appendChild(label); 
        FORM.appendChild(document.createElement('br'));
    })
}
