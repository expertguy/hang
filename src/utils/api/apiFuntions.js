/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "./axiosInstance";
// import { decryptData } from "./encrypted";
// import { setLogout } from "../redux/loginForm";

const ApiFunction = () => {
const setLogout = ()=>{
localStorage.removeItem('isLogin_admin');
}


    const navigate = useNavigate()

    const handleUserLogout = () => {
        setLogout();
    }


    // Define headers
    const header1 = {
        "Content-Type": "application/json",
    };

    const header2 = {
        "Content-Type": "multipart/form-data",
    };

    // API Functions
    const get = async (endpoint, params) => {
        try {
            const response = await axiosInstance.get(endpoint, {
                headers: {
                    header1,
                },
                params: {
                    ...params
                }
            });
            return response?.data;
        } catch (error) {
            console.error("Error in GET request:", error);
            if (error?.response?.status === 401) {
                handleUserLogout()
            }
            throw error;
        }
    };

    const post = async (endpoint, apiData, headers = header2) => {
        try {
            const response = await axiosInstance.post(endpoint, apiData, {
                headers: {
                    ...headers,
                },
            });
            return response?.data;
        } catch (error) {
            console.error("Error in POST request:", error);
            if (error?.response?.status === 401) {
                handleUserLogout()
            }
            throw error;
        }
    };

    const deleteData = async (endpoint, headers = header1) => {
        try {
            const response = await axiosInstance.delete(endpoint, {
                headers: {
                    ...headers,
                },
            });
            return response?.data;
        } catch (error) {
            console.error("Error in DELETE request:", error);
            if (error?.response?.status === 401) {
                handleUserLogout()
            }
            throw error;
        }
    };

    const put = async (endpoint, apiData, headers = header1) => {
        try {
            const response = await axiosInstance.put(endpoint, apiData, {
                headers: {
                    ...headers,
                },
            });
            return response?.data;
        } catch (error) {
            console.error("Error in PUT request:", error);
            if (error?.response?.status === 401) {
                handleUserLogout()
            }
            throw error;
        }
    };

    return {
        get,
        post,
        deleteData,
        put,
        header1,
        header2,
    };
};

export default ApiFunction;
