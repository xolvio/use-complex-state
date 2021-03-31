import { useReducer } from "react";
import {
  createSlice,
  CreateSliceOptions,
  SliceCaseReducers,
} from "@reduxjs/toolkit";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export const useComplexState = <
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends string = string
  >(
  options: Optional<CreateSliceOptions<State, CaseReducers, Name>, "name">
) => {
  const slice = createSlice({ name: "__name", ...options });
  const [state, dispatch] = useReducer(slice.reducer, options.initialState);
  Object.entries(slice.actions).forEach(
    ([name, action]) => {
      // @ts-ignore
      slice.actions[name] = (...args) => {
        // @ts-ignore
        dispatch(action(...args));
      };
    }
  );
  return [state, slice.actions, dispatch] as const;
};

export const prepareSliceOptions = <
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends string = string
  >(
  options: Optional<CreateSliceOptions<State, CaseReducers, Name>, "name">
) => {
  return { name: "__name", ...options };
};
