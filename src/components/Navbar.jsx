import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function Navbar() {

    const { user, logout } = useContext(UserContext)

    const isLoggedIn = !!user?.userid   // Checks if user has logged in (user id is set as a boolean value)

  return (
<nav className="navbar bg-transparent p-0 m-0 border-0">
      <div className="container-fluid p-0">
        {/* Toggler joka avaa offcanvasin */}
        <button
          className="navbar-toggler position-fixed top-0 end-0 m-3"
          id="menuToggleBtn"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* OFFCANVAS-valikko (avaa sivulta) */}
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/search">Search</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reviews">Reviews</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/showtimes">Showtimes</Link>
              </li>

              {!isLoggedIn && (
                <li className="nav-item">
                  <Link className="nav-link" to="/signin">Sign In</Link>
                </li>
              )}

              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/favorites">Favorites</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/groups">Groups</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile">Profile</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/" onClick={logout}>Logout</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
