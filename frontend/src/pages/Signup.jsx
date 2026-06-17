import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { MyContext } from '../hooks/Context'
import api from '../hooks/api'
import { useNavigate } from 'react-router-dom'
const Signup = () => {
  const {setCurrentUser}=useContext(MyContext)
  const navigate=useNavigate()
  const [formData, setFormData] = useState({ 
    fullName: '',
    username: '', 
    email: '',
    password: '' 
  })

  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  })

  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false
  })

  const [showPassword, setShowPassword] = useState(false)

  const validateField = (name, value) => {
    switch(name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 3) return 'Full name must be at least 3 characters'
        if (value.trim().length > 50) return 'Full name must be less than 50 characters'
        if (!/^[a-zA-Z0-9\s]+$/.test(value.trim())) return 'Only letters, numbers, and spaces allowed'
        return ''

      case 'username':
        if (!value.trim()) return 'Username is required'
        if (value.trim().length < 5) return 'Username must be at least 5 characters'
        if (value.trim().length > 20) return 'Username must be less than 20 characters'
        if (!/^[a-z0-9._-]+$/.test(value.trim())) return 'Invalid username format'
        if (!/[a-z]/.test(value.trim())) return 'Must contain at least one letter'
        return ''

      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value.trim())) {
          return 'Only Gmail addresses are allowed (example@gmail.com)'
        }
        return ''

      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (value.length > 30) return 'Password must be less than 30 characters'
        return ''

      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'username') {
      const lower = value.toLowerCase()
      setFormData(prev => ({ ...prev, [name]: lower }))
      setErrors(prev => ({ ...prev, [name]: validateField(name, lower) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name])
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isSubmitDisabled = () => {
    return !formData.fullName.trim() || 
           !formData.username.trim() || 
           !formData.email.trim() || 
           !formData.password || 
           Object.values(errors).some(error => error !== '')
  }

const submitFun = () => {
  if (validateForm()) {
    api.post('/signup', formData)

      .then((res) => {
        if (res.data.user._id) {
          toast.success("User Created Successfully")
          setCurrentUser(res.data.user)
          navigate('/')

        }

        // ✅ HANDLE DUPLICATE EMAIL ERROR
        else if (res.data.error?.includes("E11000")) {
          if (res.data.error.includes("email")) {
            toast.error("Email already exists")
          } else if (res.data.error.includes("username")) {
            toast.error("Username already exists")
          } else {
            toast.error("Duplicate field error")
          }
        }

        // ✅ OTHER BACKEND ERRORS
        else if (res.data.error) {
          toast.error(res.data.error)
        }

      })
      .catch((e) => {
        if (e.response?.data?.error) {
          toast.error(e.response.data.error)
        } else {
          toast.error("Internal Server Error")
        }
        console.log(e)
      })
  } else {
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true
    })
  }
}

  const isFieldValid = (field) => {
    return touched[field] && !errors[field] && formData[field]
  }

  // ================= UI =================
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: '400px', borderRadius: '15px' }}>
        <h3 className="text-center mb-4 fw-bold">Create Account</h3>

        {/* Full Name */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Full Name</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            className="form-control"
            placeholder="Enter your full name"
            style={{
              borderColor: touched.fullName && errors.fullName ? '#dc3545' :
                          isFieldValid('fullName') ? '#198754' : '#dee2e6'
            }}
          />
          {touched.fullName && errors.fullName && <div className="text-danger mt-1">{errors.fullName}</div>}
          {isFieldValid('fullName') && <div className="text-success mt-1">✓ Valid</div>}
        </div>

        {/* Username */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            className="form-control"
            placeholder="Enter username"
            style={{
              borderColor: touched.username && errors.username ? '#dc3545' :
                          isFieldValid('username') ? '#198754' : '#dee2e6'
            }}
          />
          {touched.username && errors.username && <div className="text-danger mt-1">{errors.username}</div>}
          {isFieldValid('username') && <div className="text-success mt-1">✓ Valid</div>}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            type="email"
            className="form-control"
            placeholder="example@gmail.com"
            style={{
              borderColor: touched.email && errors.email ? '#dc3545' :
                          isFieldValid('email') ? '#198754' : '#dee2e6'
            }}
          />
          {touched.email && errors.email && <div className="text-danger mt-1">{errors.email}</div>}
          {isFieldValid('email') && <div className="text-success mt-1">✓ Valid</div>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Password</label>
          <div className="position-relative">
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Minimum 8 characters"
              style={{
                borderColor: touched.password && errors.password ? '#dc3545' :
                            isFieldValid('password') ? '#198754' : '#dee2e6',
                paddingRight: '40px'
              }}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
          {touched.password && errors.password && <div className="text-danger mt-1">{errors.password}</div>}
          {isFieldValid('password') && <div className="text-success mt-1">✓ Valid</div>}
        </div>

        <button 
          onClick={submitFun}
          className="btn btn-dark w-100"
          disabled={isSubmitDisabled()}
        >
          Sign Up
        </button>

      </div>
    </div>
  )
}

export default Signup