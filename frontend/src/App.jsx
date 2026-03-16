import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import Sign from './pages/sign'
import Profile from './pages/profile'
import Videocall from './pages/videocall'

const App = () => {
  return (
    <div className='bg_for_all'>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/login" element={<Login />} />
        <Route path="/videocall" element={<Videocall />} />

        {/* profile page */}
        <Route path="/profile/:id" element={<Profile />} />

      </Routes>
    </div>
  )
}

export default App