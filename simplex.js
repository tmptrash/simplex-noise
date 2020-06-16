/**
 * A fast javascript implementation of simplex noise based on sources
 * of Jonas Wagner. https://github.com/jwagner/simplex-noise.js. Added
 * octaves, amplitude, scale and distribution parameters. Good explanation
 * of these parameters may be found here: https://www.redblobgames.com/maps/terrain-from-noise.
 * Only 3D version + time are implemented. By default all configs === 1
 * 
 * Config:
 *   scale     [0..1] - zoom coefficient. 0 - max zoom, 1 - min zoom
 *   amplitude [0..1] - means: take all possible height values (1) or only part of it (< 1)
 *   distrib   [0..X] - 0..1 - get values from top, 1..X get values from buttom
 *   octaves   [1..X] - amount of details of a 3D map
 *   random           - reference to random function, which return values between 0..1
 *
 * Example:
 *   let simplex = new Simplex();
 *   let t = 0;
 * 
 *   function drawNoise(width, height) {
 *     for (let x = 0; x < width; x++) {
 *       for (let y = 0; y < height; y++) {
 *         z = simplex.noise(x, y, t);
 *         // draw x,y,z point
 *       }
 *     }
 *     t += .001;
 *   }
 *   ...
 *   drawNoise(128, 128);
 * 
 * @author flatline
 */
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;
/**
 * Creates simplex noise class instance with options
 */
class Simplex {
    constructor(cfg) {
        cfg = cfg || {};

        this.amplitude = cfg.amplitude || 1.0;
        this.distrib   = cfg.distrib || 1.0;
        this.scale     = cfg.scale || 1.0;
        this.octaves   = cfg.octaves || 1;
        this.random    = cfg.random || Math.random;

        this.grad3     = new Float32Array([
            1, 1, 0,
            -1, 1, 0,
            1, -1, 0,
    
            -1, -1, 0,
            1, 0, 1,
            -1, 0, 1,
    
            1, 0, -1,
            -1, 0, -1,
            0, 1, 1,
    
            0, -1, 1,
            0, 1, -1,
            0, -1, -1
        ]);
        this.grad4     = new Float32Array([
            0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
            0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
            1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
            -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
            1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
            -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
            1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
            -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0
        ]);

        const p      = this.p = this._buildPermutationTable(Math.random);
        const perm   = this.perm = new Uint8Array(512);
        const pMod12 = this.permMod12 = new Uint8Array(512);

        for (let i = 0; i < 512; i++) {
            perm[i]   = p[i & 255];
            pMod12[i] = perm[i] % 12;
        }
    }
    /**
     * Does simplex noise. Returns height by (x,y) and time (t)
     * @param {Number} x X
     * @param {Number} y Y
     * @param {Number} t Time
     */
    noise(x, y, t) {
        t = t || 0;
        let amplitude = this.amplitude;
        let scale = this.scale;
        let noise = 0;

        for (let i = 0, l = this.octaves; i < l; i++) {
            noise += (this.rawNoise(x * scale, y * scale, t) * amplitude);
            amplitude *= .5;
            scale *= 2;
        }

        return Math.pow((noise + 1) / 2, this.distrib);
    }

    rawNoise(xin, yin, tin) {
        const permMod12 = this.permMod12;
        const perm = this.perm;
        const grad3 = this.grad3;
        let n0, n1, n2, n3; // Noise contributions from the four corners
        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin + tin) * F3; // Very nice and simple skew factor for 3D
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const k = Math.floor(tin + s);
        const t = (i + j + k) * G3;
        const X0 = i - t; // Unskew the cell origin back to (x,y,z) space
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = xin - X0; // The x,y,z distances from the cell origin
        const y0 = yin - Y0;
        const z0 = tin - Z0;
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // X Y Z order
            else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // X Z Y order
            else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // Z X Y order
        }
        else { // x0<y0
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Z Y X order
            else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Y Z X order
            else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // Y X Z order
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        const x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        const x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;
        // Work out the hashed gradient indices of the four simplex corners
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        // Calculate the contribution from the four corners
        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) n0 = 0.0;
        else {
            const gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
        }
        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) n1 = 0.0;
        else {
            const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
        }
        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) n2 = 0.0;
        else {
            const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
        }
        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) n3 = 0.0;
        else {
            const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
            t3 *= t3;
            n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 32.0 * (n0 + n1 + n2 + n3);
    }

    /**
     * Initialization method
     * @param {Function} random function reference
     */
    _buildPermutationTable(random) {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {p[i] = i}
        for (let i = 0; i < 255; i++) {
            const r = i + ~~(random() * (256 - i));
            var aux = p[i];
            p[i] = p[r];
            p[r] = aux;
        }
        return p;
    }
}