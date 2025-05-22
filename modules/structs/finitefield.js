export class FiniteField { 
    constructor(order) { 
        this.order = order; 
        this.elems = new Set(); 
        this.inverses = new Map(); 
        if (order != Number.MAX_SAFE_INTEGER) { 
            for (let i = 0; i < order; i++) {
                this.elems.add(i); 
            }   
        }
    } 
    
    static gcd = function (a, mod) { 
        if (mod == 0) { 
            return a; 
        }
        return FiniteField.gcd(mod, a % mod); 
    }   


    add(i,j) { 
        if ((i+j) < 0) {
            let num = i + j; 
            while (num < 0) {
                num += this.order; 
            }
            return num; 
        } 
        else {
            return (i+j) % this.order; 

        }
    }

    subtract(i,j) { 
        if ((i-j < 0)) { 
            let num = i - j; 
            while (num < 0) { 
                num += this.order; 
            }
        }
        else { 
            return (i - j) % this.order; 
        }
    }

    mult(i, j) { 
        if (i * j < 0) { 
            let num = i * j; 
            while (num < 0) { 
                num += this.order; 
            }
            return num; 
        } else { 
            return (i * j) % this.order; 
        }
    }

    invertible(i) { 
        return (FiniteField.gcd(i, this.order) == 1); 
    }

    invert(i) {
        if (this.inverses.has(i)) return this.inverses.get(i);

        if (i == -1 || i == 1)  {  // special case of FLT 
            return i; 
        }

        if (this.order === Number.MAX_SAFE_INTEGER) { 
            return 0; // integers not multiplicatively invertible, unless 1 or -1 
        }
        

        if (i < 0) {
            i = this.representative(i);
        }
        // console.log("given inverting value is: " + i);

        let inv = null; 

        if (this.invertible(i)) { // should try and figure out check only once for invertibility 
            for (let j = 1; j < this.order; j++) { 
                if ((j * i) % this.order === 1) {
                    inv = j;
                    break;
                } 
            }
        }

        this.inverses.set(i, inv); 
        return inv; 
    }

    division(i, j) { // i 'divided' by j, finite field multiplication really 
        let  inv = 0;                   
        if (this.invertible(j)) { 
            inv = invert(j); 
        }
        return (i * inv) % this.order;  
    }
    
    static conjugate(i,j) { // conjugation over finite fields is the identity map. 
        return i; 
    }

    representative(i) { 
        if (this.order === Number.MAX_SAFE_INTEGER) { 
            return i; 
        } else if (this.elems.has(i)) {
            return i; 
        } else if (i < 0) {
            while (i < 0) i += this.order; // if order is MAX-SAFE_INTEGER need to be careful 
            return i % this.order; 
        } else {
            return i % this.order; 
        }
    }   
}

export const FiniteFieldRegistry = {
    fields: new Map(), 
    getField(order) {
        if (!this.fields.has(order)) {
            this.fields.set(order, new FiniteField(order)); 
        }
        return this.fields.get(order); 
    }
}