import { useUser } from '../context/useUser'
import { Outlet, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ProtectedRoute() {
  const { user, signOut } = useUser()
  const [isValid, setIsValid] = useState(null)

  useEffect(() => {
    const validate = async () => {
        console.log('Validoidaan kovasti')
      if (!user?.token) {
        setIsValid(false)
        return
      }

      try {
        // When user tries to access protected route, request is sent to API to validate user's token
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (res.ok) {
          setIsValid(true)  // if token is correct and have not expired, validation is true
        } else {
          setIsValid(false) // if token is missing, incorrect or expired, validation is false
          signOut?.()
        }
      } catch (err) {
        console.error('Validation error', err)
        setIsValid(false)
      }
    }
    console.log('tämähän onnistui')
    validate()
  }, [user, signOut])

  if (isValid === null) return <p>Loading...</p>
  if (!isValid) return <Navigate to="/signin" replace />

  return <Outlet />
}
