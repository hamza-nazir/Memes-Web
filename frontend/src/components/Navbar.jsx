import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

import { MyContext } from '../hooks/Context';
import api from '../hooks/api';

const Navbar = () => {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useContext(MyContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const logoutFun = () => {
        api.get('/logout')
            .then((res) => {
                setCurrentUser({});
                localStorage.clear();
                toast.success("Logged out successfully");
                navigate('/');
                setDropdownOpen(false);
            })
            .catch((err) => {
                toast.error("Logout failed");
            });
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Get user display name
    const getUserName = () => {
        if (currentUser.name) return currentUser.name;
        if (currentUser.email) return currentUser.email.split('@')[0];
        return 'User';
    };

    // Get first letter for avatar
    const getAvatarLetter = () => {
        const name = getUserName();
        return name.charAt(0).toUpperCase();
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                {/* Logo / Brand */}
                <Link className="navbar-brand fw-bold text-dark fs-4" to="/">
                    <i className="bi bi-stars me-2"></i>
                    MemesCollector
                </Link>

                {/* Toggle Button (Mobile) */}
                <button
                    className="navbar-toggler border-0 rounded"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                     

                    </ul>

                    {/* User Dropdown / Login Button */}
                    {currentUser?.email ? (
                        <div className="ms-lg-3 position-relative" ref={dropdownRef}>
                            <button
                                className={`d-flex align-items-center gap-2 bg-transparent border-0 py-1 px-3 rounded-3 ${dropdownOpen ? 'bg-light' : ''}`}
                                onClick={toggleDropdown}
                                type="button"
                                aria-expanded={dropdownOpen}
                                style={{
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* Account Avatar */}
                                <div 
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {getAvatarLetter()}
                                </div>
                                
                                <span className="fw-medium text-dark">{getUserName()}</span>
                                
                                {/* React Icon Chevron */}
                                <div className="d-flex align-items-center" style={{ marginLeft: '4px' }}>
                                    {dropdownOpen ? (
                                        <IoChevronUp size={16} className="text-secondary" />
                                    ) : (
                                        <IoChevronDown size={16} className="text-secondary" />
                                    )}
                                </div>
                            </button>
                            
                            {/* Dropdown Menu with smooth animation */}
                            <div 
                                className={`dropdown-menu dropdown-menu-end shadow border-0 rounded-3 p-2 show ${dropdownOpen ? 'd-block' : 'd-none'}`}
                                style={{
                                    position: 'absolute',
                                    inset: '0px 0px auto auto',
                                    marginTop: '8px',
                                    minWidth: '260px',
                                    animation: dropdownOpen ? 'slideDown 0.2s ease-out' : 'none',
                                    transformOrigin: 'top right'
                                }}
                            >
                                {/* User Info Header with Avatar */}
                                <div className="px-3 py-2 border-bottom mb-2 d-flex align-items-center gap-3">
                                    <div 
                                        className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            fontSize: '18px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {getAvatarLetter()}
                                    </div>
                                    <div>
                                        <div className="fw-semibold text-dark">{currentUser.name || 'User'}</div>
                                        <small className="text-secondary" style={{ fontSize: '0.75rem' }}>{currentUser.email}</small>
                                    </div>
                                </div>
                                
                                <ul className="list-unstyled mb-0">
                                    <li>
                                        <Link 
                                            className="dropdown-item rounded-2 py-2 px-3" 
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            style={{ transition: 'all 0.2s ease' }}
                                        >
                                            <i className="bi bi-person me-2 text-secondary"></i>
                                            <span>My Profile</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            className="dropdown-item rounded-2 py-2 px-3" 
                                            to="/upload"
                                            onClick={() => setDropdownOpen(false)}
                                            style={{ transition: 'all 0.2s ease' }}
                                        >
                                            <i className="bi bi-speedometer2 me-2 text-secondary"></i>
                                            <span>Upload Content</span>
                                        </Link>
                                    </li>

                                     
                                  
                                    <li>
                                        <Link 
                                            className="dropdown-item rounded-2 py-2 px-3" 
                                            to="/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            style={{ transition: 'all 0.2s ease' }}
                                        >
                                            <i className="bi bi-gear me-2 text-secondary"></i>
                                            <span>Settings</span>
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider my-2" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger rounded-2 py-2 px-3" 
                                            onClick={logoutFun}
                                            style={{ transition: 'all 0.2s ease' }}
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                            <span>Logout</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="ms-lg-3 d-flex gap-2">
                            <Link className="btn btn-light border rounded-3 px-4 py-2 fw-medium" to="/login">
                                <i className="bi bi-box-arrow-in-right me-1"></i>
                                Login
                            </Link>
                            <Link className="btn btn-dark rounded-3 px-4 py-2 fw-medium" to="/register">
                                <i className="bi bi-person-plus-fill me-1"></i>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
{/* 
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .nav-link {
                    position: relative;
                    transition: all 0.2s ease;
                    color: #4a5568 !important;
                }
                
                .nav-link:hover {
                    color: #1a202c !important;
                    background-color: #f7fafc;
                    border-radius: 8px;
                }
                
                .dropdown-item {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .dropdown-item:hover {
                    transform: translateX(4px);
                    background-color: #f8f9fa;
                }
                
                .dropdown-item:hover i {
                    color: #1a202c !important;
                }
                
                button.bg-transparent:hover {
                    background-color: #f8f9fa !important;
                }
                
                @media (max-width: 991.98px) {
                    .dropdown-menu {
                        position: static !important;
                        width: 100%;
                        margin-top: 8px !important;
                    }
                    
                    button.bg-transparent {
                        width: 100%;
                        justify-content: space-between;
                        padding: 12px !important;
                        background-color: #f8f9fa !important;
                        border-radius: 8px !important;
                    }
                    
                    .navbar-nav .nav-link {
                        padding: 10px 16px !important;
                    }
                }
            `}</style> */}
        </nav>
    );
};

export default Navbar;