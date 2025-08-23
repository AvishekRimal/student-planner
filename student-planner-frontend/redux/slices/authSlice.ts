import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the user information
interface User {
  _id: string;
  username: string;
  email: string;
}

// Define a type for the slice's state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Define the initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  // Reducers are functions that define how the state can be updated
  reducers: {
    // This action will be "dispatched" when a user successfully logs in
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    // This action will be dispatched when a user logs out
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUserSuccess(state, action: PayloadAction<{ user: User }>) {
      if (state.user) {
        state.user.username = action.payload.user.username;
        state.user.email = action.payload.user.email;
      }
    },
  },
});

// Export the actions so we can use them in our components
export const { loginSuccess, logout, updateUserSuccess } = authSlice.actions;

// Export the reducer to be included in our main store
export default authSlice.reducer;