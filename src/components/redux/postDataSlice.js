import { createSlice } from '@reduxjs/toolkit';

export const postDataSlice = createSlice({
  name: 'post',
  initialState: {
    postData: [],
  },
  reducers: {
    setPostData: (state, action) => {
      state.postData = action.payload;
    },
    
  },
});

export const { setPostData} = postDataSlice.actions;

export default postDataSlice.reducer;