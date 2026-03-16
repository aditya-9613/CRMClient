import { useLocation, Navigate } from 'react-router-dom'
import Payment from '../Payment/Payment'


const ProtectedPayment = () => {
    const { state } = useLocation()

    // If no billing state exists — hard redirect to billing, no way to access directly
    if (!state || !state.totalAmount) {
        return <Navigate to="/billing" replace />
    }

    return <Payment />
}

export default ProtectedPayment