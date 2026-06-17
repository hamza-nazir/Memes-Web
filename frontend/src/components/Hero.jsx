import '../styles/Hero.css'
import React, { useState, useEffect, useRef } from 'react'
import { categories } from '../hooks/helper'
import api from '../hooks/api'
import { FiImage, FiVideo, FiMusic, FiHome, FiTrendingUp, FiSearch, FiUser, FiDownload, FiX, FiTag, FiLoader } from 'react-icons/fi'
import { FaHeadphones } from 'react-icons/fa'
import { useContext } from 'react'
import { MyContext } from '../hooks/Context'
import { categoryIcons } from '../hooks/helper'

const Hero = () => {
  const reachedBottom = useRef(false)
  const [imagePage, setImagePage] = useState(1)
  const [audioPage, setAudioPage] = useState(1)
  const [videoPage, setVideoPage] = useState(1)
  const [stats, setStats] = useState({
    images: 0,
    videos: 0,
    audios: 0,
  });

  const searchResultsRef = useRef(null)
  const resultsContainerRef = useRef(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/meme/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [])
  
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [audios, setAudios] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const { currentUser } = useContext(MyContext)
  
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState('all')
  const [searchLoading, setSearchLoading] = useState(false)
  const [suggestions, setSuggestions] = useState({ captions: [], tags: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [trendingTags, setTrendingTags] = useState([])
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)

  const scrollToSearchResults = () => {
    setTimeout(() => {
      if (searchResultsRef.current) {
        const yOffset = -80;
        const y = searchResultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleDownload = async (file) => {
    try {
      await api.post('/meme/increment-download', {
        contentType: file.contentType || file.type,
        contentId: file._id
      });
      
      const res = await api.get('/meme/download', {
        params: {
          key: file.key,
          fileName: file.fileName,
          fileExt: file.fileExt,
          contentId: file._id,
          contentType: file.contentType || file.type
        }
      });

      const link = document.createElement('a');
      link.href = res.data.url;
      link.click();
      
      if ((file.contentType === 'image' || file.type === 'image') && !isSearching) {
        setImages(prev => prev.map(img => 
          img._id === file._id 
            ? { ...img, downloadCount: (img.downloadCount || 0) + 1 }
            : img
        ));
      }
      if ((file.contentType === 'video' || file.type === 'video') && !isSearching) {
        setVideos(prev => prev.map(vid => 
          vid._id === file._id 
            ? { ...vid, downloadCount: (vid.downloadCount || 0) + 1 }
            : vid
        ));
      }
      if ((file.contentType === 'audio' || file.type === 'audio') && !isSearching) {
        setAudios(prev => prev.map(aud => 
          aud._id === file._id 
            ? { ...aud, downloadCount: (aud.downloadCount || 0) + 1 }
            : aud
        ));
      }
      if (isSearching && searchResults) {
        setSearchResults(prev => ({
          ...prev,
          results: prev.results.map(item =>
            item._id === file._id
              ? { ...item, downloadCount: (item.downloadCount || 0) + 1 }
              : item
          )
        }));
      }
      
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  useEffect(() => {
    fetchTrendingTags();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2 && showSearch) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions({ captions: [], tags: [] });
    }
  }, [searchQuery, showSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearch(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTrendingTags = async () => {
    try {
      const response = await api.get('/meme/trending/tags?limit=8');
      if (response.data.success) {
        setTrendingTags(response.data.tags);
      }
    } catch (error) {
      console.error('Error fetching trending tags:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.post('/meme/search/suggestions', {
        query: searchQuery,
        limit: 5
      });
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async (query = searchQuery, type = searchType, page = 1) => {
    if (!query.trim()) return;
    
    setSearchLoading(true);
    setShowSuggestions(false);
    setShowSearch(false);
    
    try {
      const response = await api.post('/meme/search', {
        query: query.trim(),
        type: type,
        page: page,
        limit: 20
      });
      
      if (response.data.success) {
        setSearchResults(response.data);
        setIsSearching(true);
        setActiveCategory(null);
        scrollToSearchResults();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setIsSearching(false);
    setSearchQuery('');
    setSearchType('all');
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    handleSearch(tag);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isSearching) return;
      
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const fullHeight = document.documentElement.scrollHeight

      const isBottom = scrollTop + windowHeight >= fullHeight - 2

      if (isBottom && !reachedBottom.current) {
        if (activeCategory === 'image') {
          setImagePage(curr => curr + 1)
        } else if (activeCategory === 'video') {
          setVideoPage(curr => curr + 1)
        } else if (activeCategory === 'audios') {
          setAudioPage(curr => curr + 1)
        }

        reachedBottom.current = true
      }

      if (!isBottom) {
        reachedBottom.current = false
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeCategory, isSearching])

  useEffect(() => {
    if (activeCategory === 'image' && !isSearching) {
      api.post('/meme/get/images', { imagePage })
        .then(res => {
          setImages(prev => [...prev, ...res.data])
        })
        .catch(err => console.error(err))
    }
  }, [imagePage, activeCategory, isSearching])

  useEffect(() => {
    if (activeCategory === 'video' && !isSearching) {
      api.post('/meme/get/videos', { videoPage })
        .then(res => {
          setVideos(prev => [...prev, ...res.data])
        })
        .catch(err => console.error(err))
    }
  }, [videoPage, activeCategory, isSearching])

  useEffect(() => {
    if (activeCategory === 'audios' && !isSearching) {
      api.post('/meme/get/audios', { audioPage })
        .then(res => {
          setAudios(prev => [...prev, ...res.data])
        })
        .catch(err => console.error(err))
    }
  }, [audioPage, activeCategory, isSearching])

  const renderContentCard = (item) => (
    <div className="col-md-6 col-lg-4 col-xl-3">
      <div className="card h-100 border-0 shadow-sm card-hover-overlay">
        <div className="position-relative">
          {item.contentType === 'image' && (
            <img 
              src={item.url} 
              alt={item.caption || 'Meme'} 
              className="card-img-top"
              style={{ height: '220px', objectFit: 'cover' }}
            />
          )}
          {item.contentType === 'video' && (
            <video 
              src={item.url} 
              className="card-img-top"
              style={{ height: '220px', objectFit: 'cover' }}
              controls
            />
          )}
          {item.contentType === 'audio' && (
            <div className="bg-dark d-flex align-items-center justify-content-center" 
                 style={{ height: '220px' }}>
              <FaHeadphones size={48} className="text-white" />
            </div>
          )}
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-dark">
              {item.contentType === 'image' && <FiImage size={12} className="me-1" />}
              {item.contentType === 'video' && <FiVideo size={12} className="me-1" />}
              {item.contentType === 'audio' && <FiMusic size={12} className="me-1" />}
              {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
            </span>
          </div>
          
          <div className="position-absolute top-0 start-0 m-2">
           
          </div>
          
          {item.tags && item.tags.length > 0 && (
            <div className="position-absolute bottom-0 start-0 m-2">
              <div className="d-flex flex-wrap gap-1">
               
              </div>
            </div>
          )}
          
          <div className="overlay">
            <button
              type="button"
              onClick={() => handleDownload(item)}
              className="btn btn-light rounded-pill px-4 py-2 fw-semibold download-btn"
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
              <FiUser size={12} className="me-1" />
              {item?.owner?.fullName}
            </small>
            <small className="text-muted d-flex align-items-center">
              <FiDownload size={10} className="me-1" />
              {item.downloadCount || 0}
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImageCard = (image) => (
    <div className="col-md-6 col-lg-4 col-xl-3">
      <div className="card h-100 border-0 shadow-sm card-hover-overlay">
        <div className="position-relative">
          <img 
            src={image.url} 
            alt={image.caption || 'Meme'} 
            className="card-img-top"
            style={{ height: '220px', objectFit: 'cover' }}
          />
          <div className="position-absolute top-0 start-0 m-2">
   
          </div>
          {image.tags && image.tags.length > 0 && (
            <div className="position-absolute bottom-0 start-0 m-2">
              <div className="d-flex flex-wrap gap-1">
             
              </div>
            </div>
          )}
          <div className="overlay">
            <button
              type="button"
              onClick={() => handleDownload({ ...image, contentType: 'image' })}
              className="btn btn-light rounded-pill px-4 py-2 fw-semibold download-btn"
            >
              <FiDownload className="me-2" />
              Download
            </button>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h6 className="card-title fw-bold mb-2 text-truncate">
            {image.caption || 'Untitled'}
          </h6>
          {image.fileName && (
            <small className="text-muted d-block mb-2 text-truncate">
              {image.fileName}
            </small>
          )}
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <small className="text-muted d-flex align-items-center">
              <FiUser size={12} className="me-1" />
              {image?.owner?.fullName}
            </small>
            <small className="text-muted d-flex align-items-center">
              <FiDownload size={10} className="me-1" />
              {image.downloadCount || 0}
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoCard = (video) => (
    <div className="col-md-6 col-lg-4 col-xl-3">
      <div className="card h-100 border-0 shadow-sm card-hover-overlay">
        <div className="position-relative">
          <video 
            src={video.url} 
            className="card-img-top"
            style={{ height: '220px', objectFit: 'cover' }}
            controls
          />
          <div className="position-absolute top-0 start-0 m-2">
        
          </div>
          {video.tags && video.tags.length > 0 && (
            <div className="position-absolute bottom-0 start-0 m-2">
              <div className="d-flex flex-wrap gap-1">
               
              </div>
            </div>
          )}
         
        </div>
        <div className="card-body d-flex flex-column">
          <h6 className="card-title fw-bold mb-2 text-truncate">
            {video.caption || 'Untitled'}
          </h6>
          {video.fileName && (
            <small className="text-muted d-block mb-2 text-truncate">
              {video.fileName}
            </small>
          )}
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <small className="text-muted d-flex align-items-center">
              <FiUser size={12} className="me-1" />
              {video?.owner?.fullName}
            </small>
            <button className='bg-dark text-white border-0 rounded-2 px-2 '  onClick={() => handleDownload({ ...video, contentType: 'video' })}>Download</button>
            <small className="text-muted d-flex align-items-center">
              <FiDownload size={10} className="me-1" />
              {video.downloadCount || 0}
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudioCard = (audio) => (
    <div className="col-md-6 col-lg-4 col-xl-3">
      <div className="card h-100 border-0 shadow-sm card-hover-overlay audio-card">
        <div className="card-body d-flex flex-column position-relative">
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-dark">
              <FiDownload size={10} className="me-1" />
              {audio.downloadCount || 0}
            </span>
          </div>
          <div className="text-center mb-3">
            <div className="bg-dark rounded-circle d-inline-flex p-3 mb-2">
              <FaHeadphones size={24} className="text-white" />
            </div>
            <span className="badge bg-dark d-block mx-auto" style={{ width: 'fit-content' }}>
              <FiMusic size={12} className="me-1" />
              Audio
            </span>
          </div>
          <h6 className="card-title fw-bold mb-2 text-center text-truncate">
            {audio.caption || 'Untitled'}
          </h6>
          {audio.fileName && (
            <small className="text-muted d-block mb-3 text-center text-truncate">
              {audio.fileName}
            </small>
          )}
          {audio.tags && audio.tags.length > 0 && (
            <div className="d-flex flex-wrap gap-1 justify-content-center mb-2">
            
            </div>
          )}
          <div className="mt-auto">
            <audio 
              src={audio.url} 
              controls 
              className="w-100 mb-2"
              style={{ height: '40px' }}
            />
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted d-flex align-items-center">
                <FiUser size={12} className="me-1" />
                {audio?.owner?.fullName}
              </small>
              <button 
                onClick={() => handleDownload({ ...audio, contentType: 'audio' })}
                className="btn btn-sm btn-outline-dark rounded-pill"
              >
                <FiDownload size={12} className="me-1" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="display-4 fw-bold mb-3">
              Browse Categories
            </h1>
            <p className="lead text-muted">
              Explore amazing content from our community
            </p>
          </div>
          <button
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="btn btn-dark rounded-pill px-4 py-3 shadow-sm"
            style={{ transition: 'all 0.2s' }}
          >
            <FiSearch size={20} className="me-2" />
            Search Content
          </button>
        </div>

        {showSearch && (
          <div className="search-modal-overlay">
            <div className="search-modal-container" ref={searchContainerRef}>
              <div className="search-modal-header">
                <h3 className="search-modal-title">
                  <FiSearch className="me-2" />
                  Search Content
                </h3>
                <button 
                  className="search-modal-close"
                  onClick={() => {
                    setShowSearch(false);
                    setShowSuggestions(false);
                  }}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="search-input-wrapper">
                <FiSearch className="search-input-icon" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input-field"
                  placeholder="Search by caption, tags, or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button 
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <FiX size={18} />
                  </button>
                )}
                {searchLoading && <FiLoader className="search-loading-icon" size={20} />}
              </div>

              <div className="search-filters">
                {['all', 'image', 'video', 'audio'].map(type => (
                  <button
                    key={type}
                    className={`search-filter-btn ${searchType === type ? 'active' : ''}`}
                    onClick={() => setSearchType(type)}
                  >
                    {type === 'all' && 'All'}
                    {type === 'image' && <><FiImage className="me-1" /> Images</>}
                    {type === 'video' && <><FiVideo className="me-1" /> Videos</>}
                    {type === 'audio' && <><FiMusic className="me-1" /> Audio</>}
                  </button>
                ))}
              </div>

              {showSuggestions && (searchQuery.length >= 2 || suggestions.captions.length > 0 || suggestions.tags.length > 0) && (
                <div className="suggestions-dropdown">
                  {suggestions.captions.length > 0 && (
                    <div className="suggestions-section">
                      <h4 className="suggestions-title">Captions</h4>
                      {suggestions.captions.map((caption, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(caption)}
                        >
                          <FiSearch size={14} />
                          <span>{caption}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {suggestions.tags.length > 0 && (
                    <div className="suggestions-section">
                      <h4 className="suggestions-title">
                        <FiTag size={14} className="me-1" />
                        Tags
                      </h4>
                      {suggestions.tags.map((tag, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(tag)}
                        >
                          <FiTag size={14} />
                          <span>#{tag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {trendingTags.length > 0 && !searchQuery && (
                <div className="trending-section">
                  <h4 className="trending-title">
                    <FiTrendingUp size={16} className="me-1" />
                    Trending Tags
                  </h4>
                  <div className="trending-tags">
                    {trendingTags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        className="trending-tag-btn"
                        onClick={() => handleTagClick(tag)}
                      >
                        #{tag}
                        <span className="tag-count">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="search-submit-btn"
                onClick={() => handleSearch()}
                disabled={searchLoading || !searchQuery.trim()}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        )}

        {!isSearching && (
          <div className="mb-5">
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCategory(category.id)}
                  className={`btn rounded-pill px-4 py-2 fw-semibold ${
                    activeCategory === category.id 
                      ? 'btn-dark' 
                      : 'btn-outline-secondary bg-white'
                  }`}
                >
                  {categoryIcons[category.id]}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {isSearching && searchResults && (
          <div ref={searchResultsRef}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">
                  Search Results for "{searchResults.query}"
                </h3>
                <p className="text-muted mb-0">
                  Found {searchResults.total} results
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="btn btn-outline-secondary rounded-pill"
              >
                Clear Search
              </button>
            </div>
            <div className="row g-4" ref={resultsContainerRef}>
              {searchResults.results.length > 0 ? (
                searchResults.results.map((item, index) => (
                  <React.Fragment key={index}>
                    {renderContentCard(item)}
                  </React.Fragment>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <FiSearch size={48} className="text-muted mb-3" />
                  <h4 className="text-muted">No results found</h4>
                  <p className="text-muted">Try different keywords or browse categories</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isSearching && (
          <div className="row g-4">
            {activeCategory === 'all' && (
              <div className="col-12">
                <div className="text-center py-5">
                  <FiHome size={50} className="text-dark mb-3" />
                  <h2 className="fw-bold">Welcome</h2>
                  <p className="text-muted mb-0">
                    Select a category to start exploring content
                  </p>
                </div>

                <div className="row g-4 px-2">
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 d-flex justify-content-center align-items-center text-center py-4">
                      <FiVideo size={30} className="text-dark mb-2" />
                      <h4 className="fw-bold mb-1">{stats.videos}+</h4>
                      <p className="text-muted mb-0">Videos</p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 d-flex justify-content-center align-items-center text-center py-4">
                      <FiMusic size={30} className="text-dark mb-2" />
                      <h4 className="fw-bold mb-1">{stats.audios}+</h4>
                      <p className="text-muted mb-0">Audios</p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 d-flex justify-content-center align-items-center text-center py-4">
                      <FiImage size={30} className="text-dark mb-2" />
                      <h4 className="fw-bold mb-1">{stats.images}+</h4>
                      <p className="text-muted mb-0">Images</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'image' && (
              <>
                <div className="col-12 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold mb-0">
                      <FiImage className="me-2" />
                      Images
                    </h3>
                  </div>
                  <hr />
                </div>
                
                {loading ? (
                  <div className="col-12 text-center py-5">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading images...</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <FiImage size={48} className="text-muted mb-3" />
                    <p className="text-muted">No images found</p>
                  </div>
                ) : (
                  images.map((image, index) => (
                    <React.Fragment key={index}>
                      {renderImageCard(image)}
                    </React.Fragment>
                  ))
                )}
              </>
            )}

            {activeCategory === 'video' && (
              <>
                <div className="col-12 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold mb-0">
                      <FiVideo className="me-2" />
                      Videos
                    </h3>
                  </div>
                  <hr />
                </div>
                
                {loading ? (
                  <div className="col-12 text-center py-5">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading videos...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <FiVideo size={48} className="text-muted mb-3" />
                    <p className="text-muted">No videos found</p>
                  </div>
                ) : (
                  videos.map((video, index) => (
                    <React.Fragment key={index}>
                      {renderVideoCard(video)}
                    </React.Fragment>
                  ))
                )}
              </>
            )}

            {activeCategory === 'audios' && (
              <>
                <div className="col-12 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold mb-0">
                      <FiMusic className="me-2" />
                      Audio
                    </h3>
                  </div>
                  <hr />
                </div>
                
                {loading ? (
                  <div className="col-12 text-center py-5">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading audio tracks...</p>
                  </div>
                ) : audios.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <FiMusic size={48} className="text-muted mb-3" />
                    <p className="text-muted">No audio found</p>
                  </div>
                ) : (
                  audios.map((audio, index) => (
                    <React.Fragment key={index}>
                      {renderAudioCard(audio)}
                    </React.Fragment>
                  ))
                )}
              </>
            )}

            {activeCategory === 'trending' && (
              <div className="col-12">
                <div className="text-center py-5">
                  <FiTrendingUp size={48} className="text-muted mb-3" />
                  <h3 className="text-muted">Trending Content</h3>
                  <p className="text-muted">Coming soon!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero