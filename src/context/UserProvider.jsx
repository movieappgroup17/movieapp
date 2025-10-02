import { useState } from 'react'
import { UserContext } from './UserContext'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'  // to notify user after login or signup
import 'react-toastify/dist/ReactToastify.css';


export default function UserProvider({ children }) {
    // retrieves user from sessionStorage
    const userFromStorage = sessionStorage.getItem('user')
    
    // setting useState for user and parsing the information if found
    const [user, setUser] = useState(userFromStorage ? 
        JSON.parse(userFromStorage) : { email: '', password: '', nickname: '' })

    // Logout function
    const logout = () => {
        sessionStorage.removeItem('user')
        setUser({ email: '', password: '', nickname: '', token: '' })
        toast.success('You have logged out! Byeee!')
    }

    // Sign up function for new users
    const signUp = async () => {
        const headers = { headers: { 'Content-Type': 'application/json' } }
        try {
            // POST request for backend
            await axios.post(`${import.meta.env.VITE_API_URL}/user/signup`, JSON.stringify({ user: user }), headers)
            setUser({ email: '', password: '', nickname: '' })  // empty fields after sign up
            toast.success('You have successfully signed up!')   // notifies user about succesfull sign up
        } catch (error) {
            if(error.response) {
                if(error.response.data.error === 'Email already registered') {
                    toast.error('This email is already registered. Sign in or use other email.')
                } else if (error.response.data.error === 'Nickname already taken') {
                        toast.error('This nickname is already taken. Choose another one.')
                } else {
                    toast.error(error.response.data.error)
                }
            } else {
                toast.error('Error signing up')
            }
            throw error
        }
            
        }
        

    // Sign in function for existing users
    const signIn = async () => {
        const headers = { headers: { 'Content-Type': 'application/json' } }

        try {
            // POST request for backend
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/signin`, { user: { email: user.email, password: user.password } },
            headers)
            const token = readAuthorizationHeader(response) // token is set via function
            console.log(response.data)
            // store user information in useState, excluding the password
            setUser({
                userid: response.data.userid,
                email: response.data.email,
                password: '',
                nickname: response.data.nickname,
                token: response.data.token
            })
            console.log("responsedata:", response.data)

            // user information is saved to sessionStorage for the browser session
            sessionStorage.setItem('user', JSON.stringify({
                userid: response.data.userid,
                email: response.data.email ?? '',
                password: '',
                nickname: response.data.nickname ?? '',
                token: response.data.token ?? ''})
            )
            
            toast.success(`WELCOME, ${response.data.nickname}!`)   // notifies user about succesfull sign in
            
            } catch (error) {
                console.error(error)
                if(error.response) {
                    if(error.response.status === 401 || error.response.status === 404) { // notifies user if signin fails due to invalid email or password
                        toast.error('Invalid email or password')
                    } else {
                        toast.error(error.response.data.error || 'Error logging in')
                    }
                } else {
                    toast.error('Error logging in')
                }
                throw error
            }
    }

    // function to read authorization header and to return token
    const readAuthorizationHeader = (response) => {
        const authHeader = response.headers['authorization']
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1]
        }
        return null
    }

    // Delete account function
    const deleteAccount = async (token) => {
        try {
            console.log('UserProviderissa token: ', token)
            await axios.delete(`${import.meta.env.VITE_API_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setUser({ email: '', password: '', nickname: '', token: '' })
            sessionStorage.removeItem('user')
            toast.success('Account deleted succesfully!')
        } catch (error) {
            console.error(error)
            toast.error('Error deleting account')
        }
    }

    // Get all reviews function
    const getReviews = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/reviews`)
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error fetching reviews')
            return []
        }
    }
    // Create new group function
    const createGroup = async (groupname, description, ownerid) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/groups`, {
                groupname,
                description,
                ownerid
            })
            toast.success('Group created successfully!')
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error creating group!')
        }
    }
    
    // Get all groups function
    const getGroups = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`)
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error fetching groups')
            return []
        }
    }

    // Delete group function
    const deleteGroup = async (groupid) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupid}`)
            toast.success('Group deleted successfully!')
        } catch (error) {
            console.error(error)
            toast.error('Error deleting group!')
        }
    }

    // Get group by id function
    const getGroupById = async (groupid) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupid}`)
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error while fetching group')
            return null
        }
    }

    // Check if user is member of group
    const checkIsGroupMember = async (groupid, userid) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupid}/members/${userid}`)
            return response.data.isMember
        } catch (error) {
            console.error(error)
            return false
        }
    }
    

    // User information and functions are given to UserContext.Provider for the whole app to use
    return (
        <UserContext.Provider value={{ user, setUser, logout, signUp, signIn, deleteAccount, getReviews, createGroup, getGroups, deleteGroup, getGroupById, checkIsGroupMember }}>
            {children}
        </UserContext.Provider>
    )
}