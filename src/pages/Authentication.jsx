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
        <div>
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
        </>
    )
}