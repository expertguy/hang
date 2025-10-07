import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

function PublicRoutes() {
    const auth = useAuth()
    return auth ? <Navigate to='/onboading' /> : <Outlet />
}

export default PublicRoutes