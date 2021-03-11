# alea-ts

A seedable pseudo-random number generator based on Johannes Baagøes' Alea, written in Typescript.


## API Documentation

[TSDoc API reference](https://spissvinkel.github.io/alea-ts/api/)


## Installation

As an npm package:

```bash
$ npm install @spissvinkel/alea
```


## Usage examples

### Just generate some random numbers

The values returned are from 0 (inclusive) to 1 (exclusive), like `Math.random()`

```javascript
import { mkAlea } from '@spissvinkel/alea';

const { random } = mkAlea();

// Probably different values every time you run the program
const myFirstRandomNumber = random();
const myNextRandomNumber = random();
```

### Always generate the same sequence of random numbers by using a known seed value

```javascript
import { mkAlea } from '@spissvinkel/alea';

const SEED_VALUE = '1234567890'; // Can be any string

const { random } = mkAlea(SEED_VALUE);

// Same values every time you run the program
const firstRandomNumberInTheSequence = random();
const secondRandomNumberInTheSequence = random();
```

### Continue the sequence of random numbers at a later date

```javascript
import { mkAlea, restoreAlea } from '@spissvinkel/alea';

const SEED_VALUE = '1234567890'; // Can be any string

const { random, getState } = mkAlea(SEED_VALUE);

// Same values every time you run the program
const firstRandomNumberInTheSequence = random();
const secondRandomNumberInTheSequence = random();

const state = getState(); // Retrieve the current state of the generator

// Maybe serialize and somehow save the state object for later
const serializedState = JSON.stringify(state);
// etc.

// Then later on, restore the generator and continue the sequence
const restoredState = JSON.parse(serializedState);
const { random: restoredRandom } = restoreAlea(restoredState);

// Same values every time you continue from the saved state
const thirdRandomNumberInTheSequence = restoredRandom();
const fourthRandomNumberInTheSequence = restoredRandom();
```

### Generate other random values besides numbers between 0 and 1

You can create utility functions to generate random values of other types

```javascript
import { mkAlea } from '@spissvinkel/alea';

const { nextT } = mkAlea();

// This creates a function that returns random booleans
const nextBool = nextT(n => n < 0.5);
const myFirstRandomBoolean = nextBool(); // True or false at random
const mySecondRandomBoolean = nextBool(); // True or false at random

// This creates a function that, given a `max` number, will create a second function which
// will generate random numbers from 0 up to, but not including, `max`
const mkNext0toMax = (max: number): () => number => nextT(n => Math.floor(n * max));

// This creates a function that returns random numbers from 0 up to, but not including, 100
const next0to100 = mkNext0toMax(100);
const x = next0to100(); // 0 <= x < 100 at random
const y = next0to100(); // 0 <= y < 100 at random

// This creates a function that, given a `values` array, will create a second function
// which will pick random elements from `values`
const mkNextElement = <T> (values: T[]): () => T => {
    const nextIndex = mkNext0toMax(values.length);
    return () => values[nextIndex()];
};

// This creates a function that returns an element of the colour array at random
const nextColour = mkNextElement([ 'red', 'green', 'blue' ]);
const firstColour = nextColour(); // Maybe 'green'
const secondColour = nextColour(); // Maybe 'red', or 'green' again
```


### Advanced usage

If you need more fine grained control over your random sequences there are also some low-level functions available

```javascript
import { AleaState, initState, mkState, nextT, random } from '@spissvinkel/alea';

const FOO_SEED = '12345';
const BAR_SEED = '67890';

const fooState = mkState(FOO_SEED);
const barState = mkState(BAR_SEED);

const myFirstFooValue = random(fooState);
const mySecondFooValue = random(fooState);
const myFirstBarValue = random(barState);
const myThirdFooValue = random(fooState);
const mySecondBarValue = random(barState);

const nextBool: (state: AleaState) => boolean = nextT(n => n < 0.5);

const myFourthFooValueIsABoolean = nextBool(fooState);
const myThirdBarValueIsAlsoABoolean = nextBool(barState);

// Reset state
initState(FOO_SEED, fooState);

const myFirstFooValueAgain = random(fooState); // Same as `myFirstFooValue`
const mySecondFooValueAgain = random(fooState); // Same as `mySecondFooValue`
```


### Background

This project originally started as a fork of [https://github.com/coverslide/node-alea](https://github.com/coverslide/node-alea).

See also [https://github.com/nquinlan/better-random-numbers-for-javascript-mirror](https://github.com/nquinlan/better-random-numbers-for-javascript-mirror) for more background information.
