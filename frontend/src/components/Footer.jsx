import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-top mt-5" style={{ borderColor: '#e2e8f0 !important' }}>
      <div className="container py-5">
        {/* Main Footer Content */}
        <div className="row">
          {/* Brand Section */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h4 className="fw-bold mb-3" style={{ color: '#1a202c' }}>
              <i className="bi bi-stars me-2"></i>
              MemesCollector
            </h4>
            <p className="text-secondary mb-3" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
              The best place to find and share memes. Join our community of meme lovers and never stop laughing.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary" style={{ transition: 'color 0.2s', fontSize: '1.1rem' }}>
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-secondary" style={{ transition: 'color 0.2s', fontSize: '1.1rem' }}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-secondary" style={{ transition: 'color 0.2s', fontSize: '1.1rem' }}>
                <i className="bi bi-github"></i>
              </a>
              <a href="#" className="text-secondary" style={{ transition: 'color 0.2s', fontSize: '1.1rem' }}>
                <i className="bi bi-discord"></i>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-lg-8">
            <div className="row">
              <div className="col-md-4 mb-4 mb-md-0">
                <h6 className="fw-semibold mb-3" style={{ color: '#1a202c', fontSize: '0.9rem' }}>
                  Quick Links
                </h6>
                <ul className="list-unstyled" style={{ fontSize: '0.85rem' }}>
                  <li className="mb-2">
                    <Link to="/" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Home
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/upload" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Upload Meme
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/services" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Services
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/contact" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="col-md-4 mb-4 mb-md-0">
                <h6 className="fw-semibold mb-3" style={{ color: '#1a202c', fontSize: '0.9rem' }}>
                  Categories
                </h6>
                <ul className="list-unstyled" style={{ fontSize: '0.85rem' }}>
                  <li className="mb-2">
                    <Link to="/memes/images" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Image Memes
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/memes/videos" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Video Memes
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/memes/gifs" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Animated GIFs
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/memes/trending" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Trending
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="col-md-4">
                <h6 className="fw-semibold mb-3" style={{ color: '#1a202c', fontSize: '0.9rem' }}>
                  Support
                </h6>
                <ul className="list-unstyled" style={{ fontSize: '0.85rem' }}>
                  <li className="mb-2">
                    <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      FAQ
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Help Center
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Report Issue
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'color 0.2s' }}>
                      Community Guidelines
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        
        <hr className="my-4" style={{ borderColor: '#e2e8f0' }} />

        {/* Bottom Section */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>
              © {currentYear} MemesCollector. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-4">
              <Link to="/privacy" className="text-secondary text-decoration-none" style={{ fontSize: '0.8rem', transition: 'color 0.2s' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-secondary text-decoration-none" style={{ fontSize: '0.8rem', transition: 'color 0.2s' }}>
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-secondary text-decoration-none" style={{ fontSize: '0.8rem', transition: 'color 0.2s' }}>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
{/* 
      <style jsx>{`
        a:hover {
          color: #1a202c !important;
        }
        
        .bi {
          transition: transform 0.2s;
        }
        
        .bi:hover {
          transform: translateY(-2px);
        }
      `}</style> */}
    </footer>
  );
};

export default Footer;