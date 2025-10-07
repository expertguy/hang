import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogin: false,
    tempUserData: null,
    token: '',
    userData: null,
  },
  reducers: {
    setLogin: (state, action) => {
      state.isLogin = action.payload;
    },
    setTempUserData: (state, action) => {
      state.tempUserData = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // localStorage.setItem('react_template_token', action.payload)
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setLogout: (state, action) => {
      state.isLogin = false;
      state.tempUserData = null;
      state.token = '';
      state.userData = null;
    }
  },
});

export const { setLogin, setLogout, setToken, setUserData, setTempUserData } = authSlice.actions;

export default authSlice.reducer;