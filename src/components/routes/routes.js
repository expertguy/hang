/* eslint-disable no-unused-vars */
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import PublicRoutes from '../redux/auth/publicRoutes'
import Nomatch from './../pages/common/nomatch'
import { useSelector } from 'react-redux'
import PrivateRoutes from './../redux/auth/privateRoutes'
import Splash from '../pages/auth/splash'
import Login from '../pages/auth/login'
import Onboading from '../pages/component/onboading/onboading'
import Home from '../pages/home'
import Chat from '../pages/chat'
import ChatConversation from '../pages/chatConversation'
import PrivateChat from '../pages/privateChat'
import Settings from '../pages/settings'
import Profile from '../pages/component/settings/profile'
import Contact from '../pages/component/settings/contact'
import Notification from '../pages/notification'
import TermsCondition from '../pages/termsCondition'
import PrivacyPolicy from '../pages/privacyPolicy'

const Routing = () => {
  const userData = useSelector(state => state.auth.userData)
  return (
    <>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path='/onboading' element={<Onboading />} />
          <Route path='/home' element={<Home />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/chat/:id' element={<ChatConversation />} />
          <Route path='/private/:id' element={<PrivateChat />} />
          <Route path='/setting' element={<Settings />} />
          <Route path='/notification' element={<Notification />} />
          <Route path='/settings' >
            <Route path='profile' element={<Profile />} />
            <Route path='contact' element={<Contact />} />
          </Route>
        </Route>
        <Route element={<PublicRoutes />}>
          <Route path='/loading' element={<Splash />} />
          <Route path='/' element={<Login />} />
        </Route>
        <Route path='*' element={<Nomatch />} />
          <Route path='/terms' element={<TermsCondition />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
      </Routes>
    </>
  )
}

export default Routing