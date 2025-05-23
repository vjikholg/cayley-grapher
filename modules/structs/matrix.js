/**
 * 
 * 
 * 
 * 
 */

import {FiniteFieldRegistry} from "./finitefield.js"; // keep singleton registry of finite field! 
export class Matrix { 
    constructor(order, m, n) { 
        this.glf = FiniteFieldRegistry.getField(order); // YES THIS IS BETTER WHAT WAS I THINKING 
        this.rows = m; 
        this.cols = n || m; // if n is not provided, we assume m x m square matrix  
        this.contents = new Array(m); 
        for (let i = 0; i < m; i++) {
            this.contents[i] = new Array(this.cols).fill(0); 
        }
        this._key = null; 
    }

    get key() { 
        if (this._key === null) { 
            // flatten by row and join w/ delimiter
            this._key = this.contents.map(r => r.join(',')).join('|');
        } 
        return this._key; 
    }


    assert(con, msg, ln) {
        if (!con) { 
            throw new RangeError(msg, "matrix.js", ln); 
        }
    }

    assertDim(mtx, ln) { 
        this.assert((this.rows == mtx.rows) && (this.cols == mtx.cols), "not same dimensions", ln); // multiplication check
    } 
    
    assertNonEmpty(ln) { 
        this.assert((this.rows == 0 || this.cols == 0), "empty matrix" , ln); 
    }
    
    assertMultCompat(ln) { 
        this.assert((this.cols == mtx.rows), "incompatible dims", ln); 
    }

    assertSquare(ln) {
        this.assert((this.cols == this.rows), "not square!", ln); 
    }

    add(mtx) {
        this.assertDim(mtx, 25); 
        this.assertNonEmpty(26); 
        mtx.assertNonEmpty(27);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; this.cols; j++) {
                this.contents[i][j] += mtx.contents[i][j]
                this.contents %= this.glf.order; 
            }
        }
    }

    mult(mtx) { // right-mult by mtx
        // this.assertDim(mtx, 48); 
        /// this.assertNonEmpty(49);
        // mtx.assertNonEmpty(50); 
        // this.assertMultCompat(mtx, 51);
        

        let sol = new Matrix(this.glf.order, this.rows, mtx.cols); 
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < mtx.cols; j++) { 
                for (let k = 0; k < this.cols; k++) {
                    sol.contents[i][j] += (this.contents[i][k] * mtx.contents[k][j]); 
                }
                sol.contents[i][j] = this.glf.representative(sol.contents[i][j]); 
            }
        }

        return sol; 

        /*
        temp = this.contents.slice();  
        console.log("multiplying: " + this.contents + " and " + mtx.contents); 
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < mtx.cols; j++) { 
                for (let k = 0; k < this.cols; k++) {
                    this.contents[i][j] += temp.contents[i][k] * mtx.contents[k][j]; 
                }
                this.contents[i][j] = this.glf.representative(this.contents[i][j]); 
            }
        }
        */
    }

    static power(m1, n) {
        let sol = m1; 
        for (let i = 0; i < n-1; i++) {
            sol *= m1; 
        }
        return sol; 
    }

    static sgn(i) { 
        return ( i % 2 == 0 ? (-1) : 1 )
    }

    det() { 
        // this.assertNonEmpty(70); // TODO: NEED TO FIX THIS LINE LATER, EMPTY MATRIX ISSUE?
        this.assertSquare(71); 
        let sol = 0; 
        if (this.rows == 1) {
            sol = this.contents[0][0] % this.glf.order;
        } else if (this.rows == 2) {
            sol = this.contents[0][0]*this.contents[1][1] - this.contents[0][1]*this.contents[1][0] ; 
        } else { 
            for (let j = 0; j < this.rows; j++) {
            sol += this.contents[0][j] * Matrix.sgn(j+1) * this.subMatrix(0,j).det(); 
            }
        }
        return sol % this.glf.order; 
    }        

    subMatrix(row, column) { // if elements belong in certain rows, certain columns, not taken. 
        let sol = new Matrix(this.glf.order, this.rows-1, this.cols-1);

        for (let i = 0, si = 0; i < this.rows; i++) {
            if (i == row) continue; 
            for (let j = 0, sj = 0; j < this.cols; j++) {
                if (j == column) continue; 
                sol.contents[si][sj] = this.contents[i][j];
                sj++;
            }
            si++;
        }
        // console.log(sol.contents);
        return sol; 
    }
    
    transpose() {
        if (this.rows == 1) {
            return this; // this may cause problems but its fine for now, since 1x1 matrices represent cyclic groups C_n 
        }

        let sol = new Matrix(this.glf.order, this.cols, this.rows)

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) { 
                sol.contents[j][i] = this.contents[i][j]
            }
        }
        return sol; 
    }

    
    cofactor() { 
        // console.log("taking cofactor of: " + this.contents);
        this.assertSquare(127); 
        if (this.rows == 1) {
            return this; 
        }

        let sol = new Matrix(this.glf.order, this.rows, this.cols); 
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                sol.contents[i][j] = this.glf.representative( (this.subMatrix(i,j).det() * ((-1) ** (i+j))) ) ; 
            }
        }
        return sol; 
    }

    /**
     * 
     * @returns 
     */
    adjugate() { 
        /*
        if (this.rows === 2 && this.cols === 2) { 
            let sol = new Matrix(this.glf.order, 2, 2); 

            let t = this.contents; 

            sol.contents = [
                [t[1][1], this.glf.representative(-t[0][1])]
                [this.glf.representative(-t[1][0]), t[0][0]]]

            return sol; 
        } else {
            return this.cofactor().transpose(); 
        }
        */ 
        return this.cofactor().transpose(); 
    }

    /**
     * 
     * @returns 
     */
    invert() { // finally, moment of truth!
        // console.log("given matrix is: " + this); 
        if (this.elems == [[-1]]) {
            return this;
        } 

        let adj = this.adjugate(); 
        // console.log("this is adjugate: " + adj.contents); 
        let det = this.det(); 
        // console.log("this is det " + det); 
        let invdet = this.glf.invert(det);  
        // console.log("this is invdet " + invdet); 
        let sol = new Matrix(this.glf.order, this.rows);

        // console.log("this is sol contents: " + sol.contents);
        // console.log(sol);
        
        for (let i = 0; i < sol.rows; i++) {
            for (let j = 0; j < sol.cols; j++) {

                sol.contents[i][j] = this.glf.representative(adj.contents[i][j] * invdet); 
            }
        }
        // console.log("this is sol contents: " + sol.contents);
        return sol; 
    }

    /**
     * 
     * @param {*} order 
     * @param {*} n 
     * @returns 
     */
    static identity(order, n) {
        let sol = new Matrix(order, n); 
        for (let i = 0; i < sol.rows; i++) {
            sol.contents[i][i] = 1; 
        }
        return sol; 
    }

    static conjugate(delta, g) {
        return g.invert().mult(delta.mult(g)); 
    }
    

    /**
     * Manual deep equality since i dont trust JSON.stringify 
     * @param {Matrix} m1 to be compared
     * @param {Matrix} m2 to be compared
     * @returns {Boolean} checking if m1 === m2 in terms of the order of its finite field + checking if 
     * contents are representatives of the same element over some finite field, i.e. 4 == 2 == 0 in Z/2Z
     */
    static isEqual(m1, m2) { 
        // return JSON.stringify(m1.contents) === JSON.stringify(m2.contents);
        
        // console.log("comparing: " + m1.contents + " to: " + m2.contents);

        if (! (m1.glf.order == m2.glf.order) ){
            console.log("incorrect order!: " + m1.glf.order + " vs. " + m2.glf.order );
            return false; // sufficient 
        } 
        if (! (m1.rows == m2.rows) ) {
            console.log("incorrect rows!"); 
            return false; 
        } 

        if (! (m1.cols == m2.cols) ) {
            console.log("incorrect columns")
            return false; 
        }
            

        for (let i = 0; i < m1.rows; i++) {
            for (let j = 0; j < m1.cols; j++) {
                // console.log("comparing " + m1.contents[i][j] + " to " + m2.contents[i][j]);
                if (( (m1.contents[i][j])  !== (m2.contents[i][j]) % m2.glf.order)) {
                    // console.log(`Mismatch at (${i}, ${j}): ${m1.contents[i][j]} !== ${m2.contents[i][j]}`)
                    return false; 
                } 
            }
        }

        return true; 
        
    }
}