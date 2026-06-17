import React from 'react'
import { FiImage, FiVideo, FiMusic, FiUser, FiMail, FiMapPin, FiEdit2, FiDownload, FiGrid, FiArrowUp, FiArrowDown, FiSave } from 'react-icons/fi'
import { FaHeadphones } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import api from '../hooks/api'
import { useContext } from 'react'
import { MyContext } from '../hooks/Context'
import Navbar from '../components/Navbar'
import { toast } from 'react-toastify'

const Profile = () => {
  const { setCurrentUser,currentUser } = useContext(MyContext)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [userContent, setUserContent] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const loadingRef = useRef(false)
  const observerRef = useRef(null)
  const itemsPerPage = 20
  
  // Edit profile modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    phoneNumber: '',
    location: ''
  })

  // Fetch profile data with pagination
  const fetchProfileContent = async (pageNum = 1, append = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    
    try {
      const res = await api.get('/get-profile', {
        params: {
          page: pageNum,
          limit: itemsPerPage,
          type: activeTab !== 'all' ? activeTab : 'all',
          sort: sortOrder
        }
      })
      
      if (append) {
        setUserContent(prev => [...prev, ...res.data.content])
      } else {
        setUserContent(res.data.content)
      }
      
      setTotalItems(res.data.total)
      setHasMore(res.data.content.length === itemsPerPage && userContent.length + res.data.content.length < res.data.total)
      
      setProfileData({
        stats: res.data.stats
      })
      
    } catch (err) {
      console.error('Error fetching profile content:', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  // Initial load and when tab/sort changes
  useEffect(() => {
    setPage(1)
    setUserContent([])
    setHasMore(true)
    fetchProfileContent(1, false)
  }, [activeTab, sortOrder])

  // Infinite scroll observer
  useEffect(() => {
    const lastElement = document.getElementById('sentinel')
    if (!lastElement) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchProfileContent(nextPage, true)
        }
      },
      { threshold: 0.1 }
    )
    
    observer.observe(lastElement)
    observerRef.current = observer
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, page, activeTab, sortOrder])

  // Open edit modal and populate form
  const openEditModal = () => {
    setEditForm({
      fullName: currentUser?.fullName || '',
      bio: currentUser?.bio || '',
      phoneNumber: currentUser?.phoneNumber || '',
      location: currentUser?.location || ''
    })
    setShowEditModal(true)
  }

  // Handle form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

const handleSaveProfile = async () => {
  try {
    const res = await api.put('/update-profile', {
      fullName: editForm.fullName,
      bio: editForm.bio,
      phoneNumber: editForm.phoneNumber,
      location: editForm.location
    });
setCurrentUser(res.data.user); 
      
      // 2. Show the success notification
      toast.success('Profile updated successfully!');
      
      // 3. Close the modal
      setShowEditModal(false);
   console.log(res.data)
  } catch (err) {
    console.error('Error updating profile:', err);
    toast.error(err.response?.data?.msg || 'Failed to update profile');
  }
};

  const handleDownload = async (item) => {
    try {
      await api.post('/meme/increment-download', {
        contentType: item.type,
        contentId: item._id
      })
      
      const res = await api.get('/meme/download', {
        params: {
          key: item.key,
          fileName: item.fileName,
          fileExt: item.fileExt,
          contentId: item._id,
          contentType: item.type
        }
      })
      
      const link = document.createElement('a')
      link.href = res.data.url
      link.click()
      
      setUserContent(prev => prev.map(content =>
        content._id === item._id
          ? { ...content, downloadCount: (content.downloadCount || 0) + 1 }
          : content
      ))
      
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const renderContentCard = (item) => (
    <div className="col-md-6 col-lg-4 col-xl-3" key={item._id}>
      <div className="card h-100 border-0 shadow-sm card-hover-overlay">
        <div className="position-relative">
          {item.type === 'image' && (
            <img 
              src={item.url} 
              alt={item.caption} 
              className="card-img-top"
              style={{ height: '220px', objectFit: 'cover' }}
            />
          )}
          {item.type === 'video' && (
            <video 
              src={item.url} 
              className="card-img-top"
              style={{ height: '220px', objectFit: 'cover' }}
              controls
              preload="metadata"
            />
          )}
          {item.type === 'audio' && (
            <div className="bg-dark d-flex flex-column align-items-center justify-content-center" 
                 style={{ height: '220px' }}>
              <FaHeadphones size={48} className="text-white mb-2" />
              <audio 
                src={item.url} 
              
                className="w-75"
                style={{ height: '40px' }}
                preload="metadata"
              />
            </div>
          )}
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-dark">
              {item.type === 'image' && <FiImage size={12} className="me-1" />}
              {item.type === 'video' && <FiVideo size={12} className="me-1" />}
              {item.type === 'audio' && <FiMusic size={12} className="me-1" />}
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
          </div>
          
          <div className="overlay position-absolute top-50 start-50 translate-middle opacity-0 transition-opacity" 
               style={{ transition: 'opacity 0.2s', zIndex: 2, pointerEvents: 'none' }}>
            <button
              type="button"
              onClick={() => handleDownload(item)}
              className="btn btn-light rounded-pill px-4 py-2 fw-semibold"
              style={{ pointerEvents: 'auto' }}
            >
              <FiDownload className="me-2" />
              Download
            </button>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h6 className="card-title fw-bold mb-2 text-truncate">
            {item.caption || 'Untitled'}
          </h6>
          {item.fileName && (
            <small className="text-muted d-block mb-2 text-truncate">
              {item.fileName}
            </small>
          )}
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <small className="text-muted d-flex align-items-center">
              <FiDownload size={10} className="me-1" />
              {item.downloadCount || 0}
            </small>
            <small className="text-muted">
              {item.createdAt && (
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              )}
            </small>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading && userContent.length === 0) {
    return (
      <>
        <Navbar />
        <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading profile...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100">
        {/* Profile Header */}
        <div className="bg-dark text-white py-5" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-auto">
                <img 
                  src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.fullName || 'User'}&background=0D6EFD&color=fff&size=128&rounded=true&bold=true`} 
                  alt={currentUser?.fullName}
                  className="rounded-circle border border-3 border-white shadow-lg"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              </div>
              <div className="col">
                <h1 className="display-5 fw-bold mb-1">{currentUser?.fullName || 'User'}</h1>
                <p className="text-white-50 mb-2">{currentUser?.username || '@user'}</p>
                <p className="mb-0">{currentUser?.bio || 'No bio yet'}</p>
                <div className="d-flex flex-wrap gap-3 mt-2">
                  <div className="d-flex align-items-center text-white-50 small">
                    <FiMail className="me-1" size={14} />
                    <span>{currentUser?.email || ''}</span>
                  </div>
                  {currentUser?.location && (
                    <div className="d-flex align-items-center text-white-50 small">
                      <FiMapPin className="me-1" size={14} />
                      <span>{currentUser.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-auto">
                <button onClick={openEditModal} className="btn btn-outline-light rounded-pill px-4">
                  <FiEdit2 className="me-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mt-5">
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 text-center py-4 stat-card h-100">
                <FiImage size={32} className="text-primary mx-auto mb-2" />
                <h3 className="fw-bold mb-1">{profileData?.stats?.images || 0}</h3>
                <p className="text-muted mb-0">Images</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 text-center py-4 stat-card h-100">
                <FiVideo size={32} className="text-danger mx-auto mb-2" />
                <h3 className="fw-bold mb-1">{profileData?.stats?.videos || 0}</h3>
                <p className="text-muted mb-0">Videos</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 text-center py-4 stat-card h-100">
                <FiMusic size={32} className="text-success mx-auto mb-2" />
                <h3 className="fw-bold mb-1">{profileData?.stats?.audios || 0}</h3>
                <p className="text-muted mb-0">Audios</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn rounded-pill px-4 py-2 fw-semibold ${
                    activeTab === 'all' ? 'btn-dark' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <FiGrid className="me-2" />
                  All ({totalItems})
                </button>
                <button
                  className={`btn rounded-pill px-4 py-2 fw-semibold ${
                    activeTab === 'image' ? 'btn-dark' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setActiveTab('image')}
                >
                  <FiImage className="me-2" />
                  Images ({profileData?.stats?.images || 0})
                </button>
                <button
                  className={`btn rounded-pill px-4 py-2 fw-semibold ${
                    activeTab === 'video' ? 'btn-dark' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setActiveTab('video')}
                >
                  <FiVideo className="me-2" />
                  Videos ({profileData?.stats?.videos || 0})
                </button>
                <button
                  className={`btn rounded-pill px-4 py-2 fw-semibold ${
                    activeTab === 'audio' ? 'btn-dark' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setActiveTab('audio')}
                >
                  <FiMusic className="me-2" />
                  Audios ({profileData?.stats?.audios || 0})
                </button>
              </div>

              <div className="d-flex gap-2">
                <button
                  className={`btn rounded-pill px-3 py-2 ${
                    sortOrder === 'newest' ? 'btn-dark' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setSortOrder('newest')}
                >
                  <FiArrowDown className="me-1" />
                  Newest
                </button>
                <button
                  className={`btn rounded-pill px-3 py-2 ${
                    sortOrder === 'oldest' ? 'btn-dark' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setSortOrder('oldest')}
                >
                  <FiArrowUp className="me-1" />
                  Oldest
                </button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="row g-4">
            {userContent.length > 0 ? (
              <>
                <div className="col-12 mb-2">
                  <h4 className="fw-bold">
                    <FiUser className="me-2" />
                    My Content
                    <small className="text-muted fs-6 ms-2">
                      ({totalItems} items)
                    </small>
                  </h4>
                  <hr />
                </div>
                {userContent.map(item => renderContentCard(item))}
                
                {hasMore && (
                  <div id="sentinel" className="col-12 text-center py-4">
                    <div className="spinner-border spinner-border-sm text-dark" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted small mt-2">Loading more...</p>
                  </div>
                )}
                
                {!hasMore && userContent.length > 0 && (
                  <div className="col-12 text-center py-4">
                    <p className="text-muted">You've reached the end! 🎉</p>
                  </div>
                )}
              </>
            ) : (
              <div className="col-12 text-center py-5">
                <FiGrid size={48} className="text-muted mb-3" />
                <h4 className="text-muted">No content yet</h4>
                <p className="text-muted">Upload your first image, video, or audio</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control rounded-3"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea 
                  style={{resize:'none'}}
                    name="bio"
                    className="form-control rounded-3"
                    rows="3"
                    value={editForm.bio}
                    onChange={handleEditChange}
                  />
                </div>

                

              </div>
              
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-dark rounded-pill px-4" onClick={handleSaveProfile}>
                  <FiSave className="me-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default Profile