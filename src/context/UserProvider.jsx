import { useState } from 'react'
import { UserContext } from './UserContext'
import axios from 'axios'
import { toast } from 'react-toastify'  // to notify user after login or signup
import 'react-toastify/dist/ReactToastify.css';


export default function UserProvider({ children }) {
    // retrieves user from sessionStorage
    const userFromStorage = sessionStorage.getItem('user')
    
    // setting useState for user and parsing the information if found
    const [user, setUser] = useState(userFromStorage ? 
        JSON.parse(userFromStorage) : { email: '', password: '', nickname: '' })

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
        }
            
        }
        

    // Sign in function for existing users
    const signIn = async () => {
        const headers = { headers: { 'Content-Type': 'application/json' } }

        try {
            // POST request for backend
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/signin`, { user: { email: user.email, password: user.password } },
            headers)
            console.log(response.data)
            // store user information in useState, excluding the password
            setUser({
                email: response.data.email,
                password: '',
                nickname: response.data.nickname
            })
            console.log("responsedata:", response.data)

            // user information is saved to sessionStorage for the browser session
            sessionStorage.setItem('user', JSON.stringify({
                email: response.data.email ?? '',
                password: '',
                nickname: response.data.nickname ?? '',
                token: response.data.token ?? ''})
            )
            
            toast.success(`WELCOME, ${response.data.nickname}!`)   // notifies user about succesfull sign in
            
            } catch (error) {
                console.error(error)
                if(error.response) {
                    if(error.response.status === 401) { // notifies user if signin fails due to invalid email or password
                        toast.error('Invalid email or password')
                    } else {
                        toast.error(error.response.data.error || 'Error logging in')
                    }
                } else {
                    toast.error('Error logging in')
                }
            }
        
    }

    // User information and functions are given to UserContext.Provider for the whole app to use
    return (
        <UserContext.Provider value={{ user, setUser, signUp, signIn }}>
            {children}
        </UserContext.Provider>
    )
}