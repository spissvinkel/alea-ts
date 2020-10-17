/**
 * An Alea PRNG
 */
export interface AleaPRNG {
    /**
     * @returns a pseudo-random floating-point number in the range `[0, 1)` (like `Math.random()`)
     */
    random: () => number;
    /**
     * @returns a pseudo-random unsigned 32-bit integer in the range `[0, 2^32)`
     */
    uint32: () => number;
    /**
     * @returns a pseudo-random full 53-bit fraction in the range `[0, 1)`. (Slower than [[`AleaPRNG.random`]] but higher precision)
     */
    fract53: () => number;
    /**
     * Creates utility functions based on this PRNG, e.g.:
     * ```
     * const alea: AleaPRNG = mkAlea();
     * const nextBool: () => boolean = alea.nextT(n => n < 0.5);
     * // calling `nextBool()` now returns `true` or `false` at random
     * //
     * const nextInt: (max: number) => () => number = max => alea.nextT(n => Math.floor(n * max));
     * const nextInt100: () => number = nextInt(100);
     * // calling `nextInt100()` now returns a random integer in the range [0, 100)
     * //
     * const choose = <T> (ts: T[]): () => T => {
     *     const nextIndex = nextInt(ts.length);
     *     return () => ts[nextIndex()];
     * };
     * const chooseColour = choose([ 'red', 'green', 'blue' ]);
     * // calling `chooseColour()` now returns a random colour
     * ```
     * @returns a function that, when invoked, transforms the next pseudo-random number `n` to a `T` using the provided function `f`
     */
    nextT: <T> (f: (n: number) => T) => () => T;
    /**
     * @returns a copy of the current state of this PRNG, which can be saved and then later passed to the [[`restoreAlea`]] function
     */
    getState: () => AleaState;
}

/**
 * The internal state of an Alea PRNG
 */
export interface AleaState {
    s0: number;
    s1: number;
    s2: number;
    c: number;
}

/**
 * Initialize a new PRNG
 *
 * @param seed an optional seed value
 * @returns an initialized PRNG
 */
export const mkAlea = (seed: string = defaultSeed()): AleaPRNG => restoreAlea(mkState(seed));

/**
 * Initialize a new PRNG from a previously saved state, effectively allowing the previous PRNG to be resumed
 *
 * @param state a state object retrieved from an existing PRNG with [[`AleaPRNG.getState`]]
 * @returns an initialized PRNG
 */
export const restoreAlea = (state: AleaState): AleaPRNG => ({
    random: () => random(state),
    uint32: () => uint32(state),
    fract53: () => fract53(state),
    nextT: f => nextT(state, f),
    getState: () => ({ ...state })
});

/** @internal */
const defaultSeed = (): string => `${Date.now()}`;

/** @internal */
const random = (state: AleaState): number => {
    let t = 2091639 * state.s0 + state.c * 2.3283064365386963e-10; // 2^-32
    state.s0 = state.s1;
    state.s1 = state.s2;
    return state.s2 = t - (state.c = t | 0);
};

/** @internal */
const uint32 = (state: AleaState): number => random(state) * 0x100000000; // 2^32

/** @internal */
const fract53 = (state: AleaState): number => random(state) + (random(state) * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53

/** @internal */
const nextT = <T> (state: AleaState, f: (n: number) => T): () => T => () => f(random(state));

/** @internal */
const mkState = (seed: string): AleaState => {

    let mash = mkMash();

    let s0 = mash(' ');
    let s1 = mash(' ');
    let s2 = mash(' ');

    let c = 1;

    s0 -= mash(seed);
    if (s0 < 0) s0 += 1;

    s1 -= mash(seed);
    if (s1 < 0) s1 += 1;

    s2 -= mash(seed);
    if (s2 < 0) s2 += 1;

    return { s0, s1, s2, c };
};

/** @internal */
const mkMash: () => (data: string) => number = () => {

    let n = 0xefc8249d;

    return data => {

        for (let i = 0; i < data.length; i++) {

            n += data.charCodeAt(i);

            let h = 0.02519603282416938 * n;

            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }

        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
};
