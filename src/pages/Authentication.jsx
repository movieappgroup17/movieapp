import { Link, useNavigate } from "react-router-dom"
import { useUser } from "../context/useUser"
import React, { useState } from 'react'
import Header from '../components/Header'

export const AuthenticationMode = Object.freeze({
    SignIn: 'SignIn',
    SignUp: 'SignUp'
})

export default function Authentication({ authenticationMode }) {
    const {user, setUser, signUp, signIn } = useUser()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
        if (authenticationMode === AuthenticationMode.SignUp) {
            await signUp()
            navigate('/signin') // Only successful sign up leads to sign in
        } else {
            await signIn()      
            navigate('/')       // Only successful sign up leads to home page
        }
    } catch (error) {
        console.log('Login failed, user stays on same page')
    }

    }

    return (
        <>
        <Header pageTitle={"Ready to make a scene?"}/>
        <div className="auth-container">
            <h3>{authenticationMode === AuthenticationMode.SignIn ? 'Sign in' : 'Sign up'}</h3>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    placeholder='Email'
                    value={user.email}
                    onChange={e => setUser({ ...user, email: e.target.value })} />

                <label>Password</label>
                <input
                    placeholder='Password'
                    type='password' value={user.password}
                    onChange={e => setUser({ ...user, password: e.target.value })}/>

                { authenticationMode === AuthenticationMode.SignUp && (
                    <>
                        <label>Nickname</label>
                        <input
                            placeholder='Nickname'
                            value={user.nickname}
                            onChange={e => setUser({ ...user, nickname: e.target.value })}
                        />
                    </>
                )}

                <button type='submit'>{authenticationMode === AuthenticationMode.SignIn ? 'Login' : 'Submit'}</button>
                <Link to={authenticationMode === AuthenticationMode.SignIn ? '/signup' : '/signin'}>
                    {authenticationMode === AuthenticationMode.SignIn ? 'No account? Sign up' : 'Already signed up? Sign in'}
                </Link>
            </form>
        </div>
        <div className="password-rules" role="alert">
            <svg
  xmlns="http://www.w3.org/2000/svg"
  width="30"    // esim. 16, 20 tai 24
  height="30"
  className="bi flex-shrink-0 me-2"
  viewBox="0 0 16 16"
  role="img"
  aria-label="Warning:"
>
  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
</svg>
<div>
    <h5>Password must contain</h5>
            <ul>
                <li>Minimum <b>8</b> characters</li>
                <li>A <b>lowercase</b> letter</li>
                <li>A <b>uppercase</b> letter</li>
                <li>A <b>number</b></li>
            </ul>
</div>
            
        </div>
        </>
    )
}