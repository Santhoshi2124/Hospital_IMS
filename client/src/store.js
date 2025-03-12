import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import inventoryReducer from './reducers/inventorySlice';
import categoryReducer from './reducers/categorySlice';
import departmentReducer from './reducers/departmentSlice';
import alertReducer from './reducers/alertSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    categories: categoryReducer,
    departments: departmentReducer,
    alert: alertReducer
  }
});

export default store;