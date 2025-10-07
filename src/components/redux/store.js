import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authSlice from './loginForm';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import sidebarSlice from './sidebar';
import postDataSlice from './postDataSlice';
import appDataSlice from './appDataSlice';
import onboadingData from './onboadingDataSlice'

const rootReducer = combineReducers({
  auth: authSlice,
  post: postDataSlice,
  appData: appDataSlice,
  onboading: onboadingData,
  sidebar: sidebarSlice.reducer
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'appData'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({
      serializableCheck: false
    });
  }
});

// Export both store and persistor
const persistor = persistStore(store);

export { store, persistor };