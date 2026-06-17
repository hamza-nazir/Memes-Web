import React,{useContext} from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import {MyContext} from '../hooks/Context'

const Home=()=>{
  const {currentUser}=useContext(MyContext)

  return (
    <div style={{backgroundColor:'#f8f9fa',minHeight:'100vh'}}>
      <Navbar/>

      <div className="bg-dark text-white py-5 mb-4" style={{
        background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        borderRadius:'0 0 30px 30px'
      }}>
        <div className="container text-center py-5">
          <h1 className="display-3 fw-bold mb-3">Welcome to MemeHub</h1>
          <p className="lead mb-4">
            The best place to find and share the funniest memes on the internet!
          </p>

         
        </div>
      </div>

      <Hero/>
    </div>
  )
}

export default Home