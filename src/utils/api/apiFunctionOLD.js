/* eslint-disable no-unused-vars */

import { axiosInstance } from './axiosInstance'

const header1 = {
  'Content-Type': 'application/json'
}
const header2 = {
  'Content-Type': 'multipart/form-data'
}

// API Functions
const get = async (endpoint, params) => {
  try {
    const response = await axiosInstance.get(endpoint, {
      headers: {
        header1
      },
      params: {
        ...params
      }
    })
    return response?.data
  } catch (error) {
    console.error('Error in GET request:', error)
    throw error
  }
}

const post = async (endpoint, apiData, headers = header1) => {
  try {
    const response = await axiosInstance.post(endpoint, apiData, {
      headers: {
        ...headers
      }
    })
    return response?.data
  } catch (error) {
    console.error('Error in POST request:', error)
    throw error
  }
}

const deleteData = async (endpoint, headers = header1) => {
  try {
    const response = await axiosInstance.delete(endpoint, {
      headers: {
        ...headers
      }
    })
    return response?.data
  } catch (error) {
    console.error('Error in DELETE request:', error)
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
    throw error
  }
}

export { get, post, deleteData, put, header1, header2 }
