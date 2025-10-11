import { toast } from 'react-toastify'

// Logout function
const logout = () => {
    sessionStorage.removeItem('user')
    setUser({ email: '', password: '', nickname: '', token: '' })
    toast.success('You have logged out! Byeee!')
}

// Logout for testing purposes
const performLogout = (setUser, toast) => {
  sessionStorage.removeItem("user")
  setUser({ email: '', password: '', nickname: '', token: '' })
  toast.success('You have logged out! Byeee!')
}

    export { logout, performLogout }