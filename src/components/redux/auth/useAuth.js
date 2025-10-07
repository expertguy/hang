import { useSelector } from 'react-redux'
import { decryptData } from '../../../utils/api/encrypted'

export const useAuth = () => {
  const encryptData = useSelector(state => state.appData?.userData);
  const decryptedData = decryptData(encryptData) || null
  return !!decryptedData
}
