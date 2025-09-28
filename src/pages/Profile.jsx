import React, { useContext } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Profile() {
  const { user, deleteAccount } = useContext(UserContext)
  const navigate = useNavigate()

  const isLoggedIn = sessionStorage.getItem('user')

  const handleDeleteAccount = async () => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        await deleteAccount(userFromStorage.userid)
        navigate('/signin')
    }
  }

  
  return (
    
    <>
      <Header pageTitle={"Profile"}/>
      <div>
        <p>Profile</p>

        <div><p>My favourites</p></div>


        {isLoggedIn && (
        <button onClick={handleDeleteAccount} className="delete-button">
          Delete your account
        </button>
        )}
      </div>
    </>
  )
}
