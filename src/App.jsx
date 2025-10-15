import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Header from './components/Header'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import SharedFavouriteList from './pages/SharedFavouritelist'
import Groups from './pages/Groups'
import GroupPage from './pages/GroupPage'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Reviews from './pages/Reviews'
import { Search } from './pages/Search'
import Showtimes from './pages/Showtimes'
import ReactPaginate from 'react-paginate'
import Authentication, { AuthenticationMode } from './pages/Authentication'
import axios from 'axios'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './components/ProtectedRoute'


function App() {

  return (
    <>
    <Navbar/>
    <div id="container">
      <Routes>
        <Route path="/" exact element={<Home/>}/>
        <Route path="/signin" element={<Authentication authenticationMode={AuthenticationMode.SignIn}/>}/>
        <Route path="/signup" element={<Authentication authenticationMode={AuthenticationMode.SignUp}/>}/>
        <Route path="/reviews" exact element={<Reviews/>}/>
        <Route path="/review/:movieID" exact element={<Reviews/>}/>
        <Route path="/search" exact element={<Search/>}/>
        <Route path="/showtimes" exact element={<Showtimes/>}/>
        <Route path="/favourites/share/:token" element={<SharedFavouriteList/>}/>
        <Route path="/*" exact element={<NotFound/>}/>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" exact element={<Profile/>}/>
          <Route path="/favorites" exact element={<Favorites/>}/>
          <Route path="/groups" exact element={<Groups/>}/>
          <Route path="/groups/:id" element={<GroupPage />} />
        </Route>
      </Routes>
    </div>
    <ToastContainer/>
    </>
  )
}

export default App
