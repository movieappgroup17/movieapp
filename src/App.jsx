import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Groups from './pages/Groups'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Reviews from './pages/Reviews'
import { Search } from './pages/Search'
import Showtimes from './pages/Showtimes'
import ReactPaginate from 'react-paginate'


function App() {

  return (
    <>
    <Navbar/>
    <div id="container">
      <Routes>
        <Route path="/" exact element={<Home/>}/>
        <Route path="/favorites" exact element={<Favorites/>}/>
        <Route path="/groups" exact element={<Groups/>}/>
        <Route path="/*" exact element={<NotFound/>}/>
        <Route path="/profile" exact element={<Profile/>}/>
        <Route path="/reviews" exact element={<Reviews/>}/>
        <Route path="/search" exact element={<Search/>}/>
        <Route path="/showtimes" exact element={<Showtimes/>}/>
      </Routes>
    </div>
    <Footer/>
    </>
  )
}


export default App
