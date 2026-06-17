import React, { useState } from 'react';
import api from '../hooks/api';
import { useContext } from 'react';
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'
import { MyContext } from '../hooks/Context';
const Login = () => {
  const navigate=useNavigate();
  const {currentUser,setCurrentUser}=useContext(MyContext)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      api.post('/login',{username,password})
      .then((res)=>{
        setCurrentUser(res.data.user)
        toast.success("Login Successfully")
        navigate('/')
      })
      .catch((err)=>{
        console.log(err)
      })
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: '400px', borderRadius: '15px' }}>
        <h3 className="text-center mb-4 fw-bold">Login</h3>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-dark w-100 mb-3" onClick={handleLogin}>
          Submit
        </button>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted">OR</span>
          <hr className="flex-grow-1" />
        </div>

        <button onClick={()=>{window.location.href = `${import.meta.env.VITE_BACK_END}/auth/google`}} className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2">
          <img src="logo.png" alt="Google" width="20" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;