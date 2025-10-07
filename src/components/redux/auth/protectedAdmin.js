import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoutes() {
    const userData = useSelector(state => state.auth.userData)
    return userData?.type === 'admin' ? <Navigate to='/admin/reviews' /> : <Outlet />
}

export default ProtectedRoutes