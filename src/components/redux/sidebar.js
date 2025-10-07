import { createSlice } from '@reduxjs/toolkit';

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    collapse: false,
    toggle: false,
  },
  reducers: {
    setSideCollapse: (state, action) => {
      state.collapse = action.payload;
    },
    setToggle: (state, action) => {
      state.toggle = action.payload;
    }
  },
});

export const { setSideCollapse, setToggle } = sidebarSlice.actions;

export default sidebarSlice.reducer;