import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useEffect } from 'react'

function PrivateRoutes() {
    const auth = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!auth) {
            navigate('/')
        }
    }, [auth, navigate])

    return auth ? <Outlet /> : <Navigate to='/' />
}

export default PrivateRoutes