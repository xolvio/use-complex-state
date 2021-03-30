Introducing useComplexState hook, a small wrapper combining Redux Toolkit, useReducer with some extra syntax sugar to make things even simpler and more to-the-point.

## Why?

useReducer is a low-level counterpart to Redux, but is meant to be used for a much smaller scope (usually a single component). As such, it comes with similar problems that Redux does out of the box - the default code is unnecessarily verbose and difficult to type.
Redux Toolkit solves those problems for Redux, but it's not really meant out of the box for useReducer. This package changes that, allowing you to use the best of both worlds.

## How?

```
npm install use-complex-state
```

And then:

```typescript
import { useComplexState } from "use-complex-state";
```

Pass to it an options object in the shape of what createSlice takes. It returns an array with a form:

```typescript
[state, objectWithActions, dispatch];
```

_note: the dispatch is exposed just in case, but you will most likely not need it_

## What?

Turn this:

```typescript jsx
import { useReducer } from "react";
const initialState = { count: 0 };

function reducer(
  state = initialState,
  action: { type: string; payload?: any }
) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "incrementBy":
      return { count: state.count + action.payload };
    default:
      throw new Error();
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <div>
      {state.count}
      <button onClick={() => dispatch({ type: "incrementBy", payload: 2 })}>
        2 points!
      </button>
      <button onClick={() => dispatch({ type: "increment" })}>1 point</button>
    </div>
  );
}
```

Into this:

```typescript jsx
import { PayloadAction } from "@reduxjs/toolkit";
import { useComplexState } from "use-complex-state";

export default function App() {
  const [state, { incrementBy, increment }] = useComplexState({
    initialState: { count: 0 },
    reducers: {
      increment: (state) => {
        state.count += 1;
      },
      incrementBy: (state, action: PayloadAction<number>) => {
        state.count += action.payload;
      },
    },
  });

  return (
    <div>
      {state.count}
      <button onClick={() => incrementBy(2)}>2 points!</button>
      <button onClick={() => increment()}>1 point</button>
    </div>
  );
}
```

## Comparison with using Redux toolkit and useReducer directly:

```typescript jsx
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = { count: 0 }; // #2
const {
  actions: { increment, incrementBy },
  reducer,
} = createSlice({
  name: "counter", // #1
  initialState, // #2
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    incrementBy: (state, action: PayloadAction<number>) => {
      state.count += action.payload;
    },
  },
});

function App() {
  const [state, dispatch] = useReducer(reducer, initialState /* #2 */);

  return (
    <div>
      {state.count}
      <button onClick={() => dispatch(incrementBy(2)) /* #3 */}>
        2 points!
      </button>
      <button onClick={() => dispatch(increment()) /* #3 */}>1 point</button>
    </div>
  );
}
```

The differences are (compare with the use-complex-state example just above):

1. The name is optional. Since we are not combining multiple slices together, like you would likely do with redux, this is just unnecessary noise.
2. You pass the initialState just once, and you can define it in-line.
3. No need to wrap the actions with dispatches. That wrapping is ugly, noise'y, and easy to mess up (no warning if you call the action without a dispatch - might be a confusing bug to debug)

## Testing

You might want to use react-testing-library, or even an browser-based tool like cypress (with react component testing) to verify the behavior of your component. If your reducers are super complex and you would like to test them without React context, you can move your slice definition out of your component:

```typescript jsx
import { PayloadAction } from "@reduxjs/toolkit";
import { useComplexState } from "use-complex-state";

export const sliceOptions = {
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    incrementBy: (state, action: PayloadAction<number>) => {
      state.count += action.payload;
    },
  },
};

export default function App() {
  const [state, { incrementBy, increment }] = useComplexState(sliceOptions);

  return (
    <div>
      {state.count}
      <button onClick={() => incrementBy(2)}>2 points!</button>
      <button onClick={() => increment()}>1 point</button>
    </div>
  );
}
```

Then in your tests you can test it the same way you would test redux toolkit slice:

```typescript
import { createSlice } from "@reduxjs/toolkit";
import { sliceOptions } from "./App";
const {
  actions: { increment, incrementBy },
  reducer,
} = createSlice(sliceOptions);

test("increase by one", () => {
  expect(reducer({ count: 1 }, increment())).toEqual({ count: 2 });
});

test("increment by two", () => {
  expect(reducer({ count: 1 }, incrementBy(2))).toEqual({ count: 3 });
});

test("multiple actions", () => {
  const actions = [increment(), incrementBy(10), incrementBy(100)];

  expect(actions.reduce(reducer, { count: 0 })).toEqual({ count: 111 });
});
```
