import { Route,Routes } from 'react-router-dom'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { ToastContainer} from 'react-toastify';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Home from './pages/Home'
const App = () => {
  return (
    <>
   <ToastContainer 
        position="bottom-center"
        autoClose={2000}          
        hideProgressBar={true}   
        toastStyle={{
          backgroundColor: "black",
          color: "white",         
        }}
      /> <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/upload' element={<Upload/>}/>
      <Route path='/profile' element={<Profile/>}/>

      <Route path='/about' element={<About/>}/>
    </Routes>
    </>
  )
}

export default App