import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // We are telling our store that the 'auth' piece of our state
    // will be managed by the authReducer
    auth: authReducer,
  },
});

// These are important TypeScript types that we will use in our app
// It infers the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;