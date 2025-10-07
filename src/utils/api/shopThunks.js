import {
  fetchShopFailure,
  fetchShopStart,
  fetchShopSuccess
} from '../../components/redux/counter/shopData'
import { handleError } from './errorHandler'
import { axiosInstance } from './axiosInstance'

// Define headers
const header1 = {
  'Content-Type': 'application/json'
}

// Direct API functions without using hooks
const get = async (endpoint, params) => {
  try {
    const response = await axiosInstance.get(endpoint, {
      headers: header1,
      params: {
        ...params
      }
    })
    return response?.data
  } catch (error) {
    console.error('Error in GET request:', error)
    if (error?.response?.status === 401) {
      localStorage.removeItem('isLogin_admin')
    }
    throw error
  }
}

const put = async (endpoint, apiData, headers = header1) => {
  try {
    const response = await axiosInstance.put(endpoint, apiData, {
      headers: {
        ...headers
      }
    })
    return response?.data
  } catch (error) {
    console.error('Error in PUT request:', error)
    if (error?.response?.status === 401) {
      localStorage.removeItem('isLogin_admin')
    }
    throw error
  }
}

// Thunk action to fetch shop data
export const fetchShopData = shopId => async dispatch => {
  try {
    dispatch(fetchShopStart())

    // Make API request to get shop data
    const response = await get(`shop/${shopId}`)

    if (response.success) {
      localStorage.setItem('shopId', response?.data?._id)

      dispatch(fetchShopSuccess(response.data))
    } else {
      dispatch(
        fetchShopFailure(response.message || 'Failed to fetch shop data')
      )
    }
  } catch (error) {
    handleError(error)
    dispatch(
      fetchShopFailure(
        error.message || 'An error occurred while fetching shop data'
      )
    )
  }
}
export const fetchShopDataShopID = shopId => async dispatch => {
  try {
    dispatch(fetchShopStart())

    // Make API request to get shop data
    const response = await get(`shop/id/${shopId}`)

    if (response.success) {
      localStorage.setItem('shopId', response?.data?._id)
      dispatch(fetchShopSuccess(response.data))
    } else {
      dispatch(
        fetchShopFailure(response.message || 'Failed to fetch shop data')
      )
    }
  } catch (error) {
    handleError(error)
    dispatch(
      fetchShopFailure(
        error.message || 'An error occurred while fetching shop data'
      )
    )
  }
}

export const fetchShopDataShopURL = shopURL => async dispatch => {
  try {
    dispatch(fetchShopStart())

    // Make API request to get shop data
    const response = await get(`shop/url/${shopURL}`)

    if (response.success) {
      localStorage.setItem('shopId', response?.data?._id)
      dispatch(fetchShopSuccess(response.data))
    } else {
      dispatch(
        fetchShopFailure(response.message || 'Failed to fetch shop data')
      )
    }
  } catch (error) {
    handleError(error)
    dispatch(
      fetchShopFailure(
        error.message || 'An error occurred while fetching shop data'
      )
    )
  }
}

// Thunk action to update shop working hours
export const updateShopWorkingHours =
  workingHours => async (dispatch, getState) => {
    try {
      const { shopData } = getState().shop

      // Make API request to update shop working hours
      const response = await put('shop/update', { workingHours })

      if (response.result) {
        // Update local state with new working hours
        dispatch(fetchShopData(shopData?._id))
      }

      return response
    } catch (error) {
      handleError(error)
      throw error
    }
  }

// Thunk action to update shop date overrides
export const updateShopDateOverrides =
  date_overrides => async (dispatch, getState) => {
    try {
      const { shopData } = getState().shop

      // Make API request to update shop date overrides
      const response = await put('store/update', { date_overrides })

      if (response.result) {
        // Update local state with new date overrides
        dispatch(fetchShopData(shopData?._id))
      }

      return response
    } catch (error) {
      handleError(error)
      throw error
    }
  }
