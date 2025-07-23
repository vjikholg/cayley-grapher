import { initializeSettings, updateSettings } from "./settingsbox.js";
import { allGroups } from "./grouplist.js";
import { BUS } from "./bus.js";

const SELECT = document.getElementById('group-select');
SELECT.dispatchEvent(new Event('change'));

export function initializeDropdown(defIdx) {
    allGroups.getList().forEach((g,i) => {
        const opt = document.createElement('option');
        opt.value = i; 
        opt.innerHTML = `${g.name} (${g.order})`; 
        SELECT.appendChild(opt); 
    });

    SELECT.value = defIdx;
    
    SELECT.addEventListener('change', () => {
        const idx = parseInt(SELECT.value); 
        const group = allGroups.getByIndex(idx);
        BUS.dispatchEvent(new CustomEvent('group-change', {detail: group})); 
    })
    return true;
}

