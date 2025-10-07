import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loginLoader: false,
  checkInTime: '',
  checkInStatus: false,
  checkInData: {},
  languages: [
    { name: 'English', code: 'US', flag: 'https://flagcdn.com/us.svg' },
    { name: 'Spanish', code: 'ES', flag: 'https://flagcdn.com/es.svg' },
    { name: 'French', code: 'FR', flag: 'https://flagcdn.com/fr.svg' },
    { name: 'German', code: 'DE', flag: 'https://flagcdn.com/de.svg' },
    { name: 'Arabic', code: 'SA', flag: 'https://flagcdn.com/sa.svg' },
    { name: 'Hebrew', code: 'IL', flag: 'https://flagcdn.com/il.svg' }
  ],
  userData: {},
  userToken: null,
  visibility:false,
  visibilityData:[]
}

export const counterSlice = createSlice({
  name: 'appDataSlice',
  initialState,
  reducers: {
    setVisibility: (state, action) => {
      state.visibility = action.payload
    },
    setVisibilityData: (state, action) => {
      state.visibilityData = action.payload
    },
    setCheckInStatus: (state, action) => {
      state.checkInStatus = action.payload
    },
    setCheckInData: (state, action) => {
      state.checkInData = action.payload
    },
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setUserToken: (state, action) => {
      state.userToken = action.payload
    },
    setCheckinTime: (state, action) => {
      state.checkInTime = action.payload
    },
    setLoginDrawer: (state, action) => {
      state.loginLoader = action.payload
    },
    logoutUser: state => {
      state.userData = null
      state.userToken = null
      state.checkInData = {}
      state.checkInStatus = false
      state.checkInTime = ''
    }
  }
})

// Action creators are generated for each case reducer function
export const {
  setCheckInData,
  setCheckInStatus,
  setUserData,
  setUserToken,
  setCheckinTime,
  logoutUser,
  setLoginDrawer,
  setVisibility,
  setVisibilityData
} = counterSlice.actions

export default counterSlice.reducer
