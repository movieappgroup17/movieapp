import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import SharedFavouriteList from './pages/SharedFavouritelist'
import Groups from './pages/Groups'
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


function App() {

  return (
    <>
    <Navbar/>
    <div id="container">
      <Routes>
        <Route path="/" exact element={<Home/>}/>
        <Route path="/favorites" exact element={<Favorites/>}/>
        <Route path="/favourites/share/:token" element={<SharedFavouriteList/>}/>
        <Route path="/groups" exact element={<Groups/>}/>
        <Route path="/*" exact element={<NotFound/>}/>
        <Route path="/profile" exact element={<Profile/>}/>
        <Route path="/reviews" exact element={<Reviews/>}/>
        <Route path="/review/:movieID" exact element={<Reviews/>}/>
        <Route path="/search" exact element={<Search/>}/>
        <Route path="/showtimes" exact element={<Showtimes/>}/>
        <Route path="/signin" element={<Authentication authenticationMode={AuthenticationMode.SignIn}/>}/>
        <Route path="/signup" element={<Authentication authenticationMode={AuthenticationMode.SignUp}/>}/>
      </Routes>
    </div>
    <Footer/>
    <ToastContainer/>
    </>
  )
}

export default App
