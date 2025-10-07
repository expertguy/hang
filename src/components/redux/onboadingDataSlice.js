import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  OnboadingProfile: null,
}

export const counterSlice = createSlice({
  name: 'onboadingData',
  initialState,
  reducers: {
    setOnboadingProfileData: (state, action) => {
            state.OnboadingProfile = action.payload
    },
    setInterestData: (state, action) => {
      state.interests = action.payload;
    }
  }
})

// Action creators are generated for each case reducer function
export const { setOnboadingProfileData,setInterestData} = counterSlice.actions

export default counterSlice.reducer
