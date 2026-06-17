import React, { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../hooks/api'
import UploadDialog from '../components/UploadDialog'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Upload = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileType, setFileType] = useState(null) // 'image', 'video', or 'audio'
  const [fileName, setFileName] = useState('')
  const [caption, setCaption] = useState('')
  const [tags, setTags] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false) // Loading state
  
  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (audioRef.current && fileType === 'audio') {
      const audio = audioRef.current
      
      const setAudioData = () => {
        setDuration(audio.duration)
        setCurrentTime(audio.currentTime)
      }
      
      const setAudioTime = () => {
        setCurrentTime(audio.currentTime)
      }
      
      const handleAudioEnd = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }
      
      audio.addEventListener('loadedmetadata', setAudioData)
      audio.addEventListener('timeupdate', setAudioTime)
      audio.addEventListener('ended', handleAudioEnd)
      
      return () => {
        audio.removeEventListener('loadedmetadata', setAudioData)
        audio.removeEventListener('timeupdate', setAudioTime)
        audio.removeEventListener('ended', handleAudioEnd)
      }
    }
  }, [fileType, preview])

  const validateFile = (selectedFile) => {
    return new Promise((resolve, reject) => {
      setError('')
      
      // Check file size for images (max 12MB)
      if (selectedFile.type.startsWith('image/')) {
        const maxSize = 12 * 1024 * 1024 // 12MB
        if (selectedFile.size > maxSize) {
          reject('Image file size cannot exceed 12MB')
          return
        }
        resolve(true)
        return
      }
      
      // For video and audio, check duration
      if (selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/')) {
        const mediaElement = selectedFile.type.startsWith('video/') 
          ? document.createElement('video') 
          : document.createElement('audio')
        
        const url = URL.createObjectURL(selectedFile)
        
        mediaElement.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url)
          
          // Video: max 10 seconds, Audio: max 25 seconds
          if (selectedFile.type.startsWith('video/') && mediaElement.duration > 10) {
            reject('Video duration cannot exceed 10 seconds')
          } else if (selectedFile.type.startsWith('audio/') && mediaElement.duration > 25) {
            reject('Audio duration cannot exceed 25 seconds')
          } else {
            resolve(true)
          }
        })
        
        mediaElement.addEventListener('error', () => {
          URL.revokeObjectURL(url)
          reject('Error loading media file')
        })
        
        mediaElement.src = url
        mediaElement.load()
      } else {
        resolve(true)
      }
    })
  }

  const handleFile = async (selectedFile) => {
    if (selectedFile) {
      try {
        await validateFile(selectedFile)
        
        setFile(selectedFile)
        
        // Extract filename without extension for editable field
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
        setFileName(nameWithoutExt)

        if (selectedFile.type.startsWith('image/')) {
          if (preview) URL.revokeObjectURL(preview)
          const imageUrl = URL.createObjectURL(selectedFile)
          setPreview(imageUrl)
          setFileType('image')
        } else if (selectedFile.type.startsWith('video/')) {
          if (preview) URL.revokeObjectURL(preview)
          const videoUrl = URL.createObjectURL(selectedFile)
          setPreview(videoUrl)
          setFileType('video')
        } else if (selectedFile.type.startsWith('audio/')) {
          if (preview) URL.revokeObjectURL(preview)
          const audioUrl = URL.createObjectURL(selectedFile)
          setPreview(audioUrl)
          setFileType('audio')
          setIsPlaying(false)
          setCurrentTime(0)
          setDuration(0)
        } else {
          setPreview(null)
          setFileType(null)
          setError('Please select an image, video, or audio file')
          setFile(null)
        }
      } catch (err) {
        setError(err)
        setFile(null)
        setPreview(null)
        setFileType(null)
        setFileName('')
        
        // Clear file input
        const fileInput = document.getElementById('fileInput')
        if (fileInput) {
          fileInput.value = ''
        }
      }
    }
  }

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setFileType(null)
    setFileName('')
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError('')
    
    const fileInput = document.getElementById('fileInput')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/') || droppedFile.type.startsWith('audio/'))) {
      handleFile(droppedFile)
    } else {
      setError('Please drop an image, video, or audio file')
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isUploading) return
    
    // Validate caption is required
    if (!caption.trim()) {
      setError('Caption is required')
      return
    }
    
    if (!file) {
      setError('Please select a file to upload')
      return
    }
    
    // Validate filename is not empty
    if (!fileName.trim()) {
      setError('Filename is required')
      return
    }
    
    // Process tags - split by comma and trim whitespace
    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    const formData = new FormData()
    if (file) formData.append('file', file)
    if (fileName) formData.append('fileName', fileName)
    if (caption) formData.append('caption', caption)
    if (tagsArray.length > 0) formData.append('tags', JSON.stringify(tagsArray))
    
    // Start uploading
    setIsUploading(true)
    
    try {
      const res = await api.post('/meme/add/data', formData)
      
      if (res.data.success) {
        toast.success("Uploaded Successfully!")
        // Reset form after successful upload
        removeImage()
        setCaption('')
        setTags('')
        setError('')
        // Redirect to profile page after 1.5 seconds
        setTimeout(() => {
          navigate('/profile')
        }, 1500)
      } else if (res.data.failure) {
        toast.error(res.data.msg || "Please login to upload")
        setError(res.data.msg || "Please login to upload")
        setIsUploading(false)
      } else {
        toast.error("Upload failed. Please try again.")
        setIsUploading(false)
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.response?.data?.msg || "Upload failed. Please try again.")
      setError(err.response?.data?.msg || "Upload failed. Please try again.")
      setIsUploading(false)
    }
  }

  const sliderStyles = {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: `linear-gradient(to right, #000000 0%, #000000 ${(currentTime / (duration || 1)) * 100}%, #e5e7eb ${(currentTime / (duration || 1)) * 100}%, #e5e7eb 100%)`,
    outline: 'none'
  }

  const volumeSliderStyles = {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '80px',
    height: '4px',
    borderRadius: '2px',
    background: `linear-gradient(to right, #000000 0%, #000000 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`,
    outline: 'none'
  }

  return (
    <>
      <Navbar />
      <UploadDialog />
      <div className="container-fluid d-flex align-items-center justify-content-center" style={{ maxWidth: '1200px', marginTop: '5px' }}>
        <div className="row w-100">
          <div className="col-12">
            <div className="card border-0 rounded-4 overflow-hidden" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <div className="card-body p-4">

                <h3 className="text-center mb-3 fw-semibold">
                  Upload File
                </h3>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Left Column - Form Fields */}
                    <div className="col-md-6">
                      {/* Editable Filename Field */}
                      <div className="mb-3">
                        <label className="form-label">
                          Filename <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="Enter filename"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          required
                          disabled={!file || isUploading}
                        />
                        <small className="text-muted">
                          You can change the filename (without extension)
                        </small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Caption <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control rounded-3"
                          rows="2"
                          placeholder="Enter a caption for your post"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          required
                          disabled={isUploading}
                        />
                        <small className="text-muted">
                          A short description of your file
                        </small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Tags <span className="text-muted">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="e.g., nature, travel, music, funny"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          disabled={isUploading}
                        />
                        <small className="text-muted">
                          Separate tags with commas for better search results
                        </small>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-dark w-100 rounded-3 py-2"
                        disabled={isUploading || !file}
                      >
                        {isUploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Uploading...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>

                    {/* Right Column - File Upload & Preview */}
                    <div className="col-md-6">
                      <div
                        className={`border rounded-4 text-center mb-3 ${dragActive ? 'bg-light border-dark' : 'border-secondary-subtle'}`}
                        style={{ borderStyle: 'dashed', cursor: isUploading ? 'not-allowed' : 'pointer', padding: '12px' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => !isUploading && setDragActive(true)}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={!isUploading ? handleDrop : undefined}
                      >
                        <input
                          type="file"
                          id="fileInput"
                          hidden
                          accept="image/*,video/*,audio/*"
                          onChange={(e) => handleFile(e.target.files[0])}
                          disabled={isUploading}
                        />

                        <label
                          htmlFor="fileInput"
                          className="w-100 h-100"
                          style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
                        >
                          <p className="mb-1 fw-medium" style={{ fontSize: '13px' }}>
                            {file ? file.name : 'Drag & Drop image, video, or audio here'}
                          </p>
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            or click to choose file
                          </small>
                          <div className="mt-1">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                              • Images max 12MB
                            </small>
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                              • Videos max 10 seconds
                            </small>
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                              • Audio max 25 seconds
                            </small>
                          </div>
                        </label>
                      </div>

                      {/* Error message moved here - below drag & drop on right side */}
                      {error && (
                        <div className="alert alert-danger alert-dismissible fade show mb-3 py-2" role="alert">
                          <small>{error}</small>
                          <button 
                            type="button" 
                            className="btn-close btn-sm" 
                            data-bs-dismiss="alert" 
                            aria-label="Close"
                            onClick={() => setError('')}
                          ></button>
                        </div>
                      )}

                      {preview && (
                        <div className="position-relative">
                          <button
                            type="button"
                            className="btn btn-sm btn-dark position-absolute top-0 end-0 rounded-circle"
                            style={{
                              width: '28px',
                              height: '28px',
                              zIndex: '10',
                              fontSize: '16px',
                              lineHeight: '1'
                            }}
                            onClick={removeImage}
                            disabled={isUploading}
                          >
                            ×
                          </button>

                          <div className="border rounded-4 overflow-hidden d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f9fa', minHeight: '200px' }}>
                            {fileType === 'image' ? (
                              <img
                                src={preview}
                                alt="preview"
                                className="w-100"
                                style={{
                                  maxHeight: '200px',
                                  objectFit: 'contain'
                                }}
                              />
                            ) : fileType === 'video' ? (
                              <video
                                ref={videoRef}
                                src={preview}
                                controls
                                className="w-100"
                                style={{
                                  maxHeight: '200px',
                                  width: '100%',
                                  objectFit: 'contain'
                                }}
                                controlsList="nodownload"
                              />
                            ) : (
                              <div className="w-100 px-3 py-2">
                                {/* Custom Audio Player */}
                                <audio ref={audioRef} src={preview} preload="metadata" />
                                
                                <div className="text-center">
                                  <div className="mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-music-note-beamed text-secondary" viewBox="0 0 16 16">
                                      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
                                      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
                                      <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z"/>
                                    </svg>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="text-muted small" style={{ fontSize: '11px', minWidth: '35px' }}>
                                      {formatTime(currentTime)}
                                    </span>
                                    <input
                                      type="range"
                                      className="flex-grow-1"
                                      value={currentTime}
                                      min="0"
                                      max={duration || 0}
                                      step="0.1"
                                      onChange={handleTimeChange}
                                      style={sliderStyles}
                                    />
                                    <span className="text-muted small" style={{ fontSize: '11px', minWidth: '35px' }}>
                                      {formatTime(duration)}
                                    </span>
                                  </div>
                                  
                                  {/* Controls */}
                                  <div className="d-flex align-items-center justify-content-center gap-2">
                                    <button
                                      type="button"
                                      onClick={togglePlayPause}
                                      className="btn btn-link text-dark p-0"
                                      style={{ textDecoration: 'none', fontSize: '18px' }}
                                    >
                                      {isPlaying ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                        </svg>
                                      )}
                                    </button>
                                    
                                    <div className="d-flex align-items-center gap-1" style={{ width: '70px' }}>
                                      <button
                                        type="button"
                                        onClick={toggleMute}
                                        className="btn btn-link text-dark p-0"
                                        style={{ textDecoration: 'none', fontSize: '12px' }}
                                      >
                                        {isMuted || volume === 0 ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM8 4a.5.5 0 0 1 .5-.5h.011a4.5 4.5 0 1 1 0 9H8.5a.5.5 0 0 1 0-1h.011a3.5 3.5 0 1 0 0-7H8.5A.5.5 0 0 1 8 4z"/>
                                          </svg>
                                        ) : volume < 0.5 ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zm3.025 4a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z"/>
                                          </svg>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                                            <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707z"/>
                                            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                          </svg>
                                        )}
                                      </button>
                                      <input
                                        type="range"
                                        value={isMuted ? 0 : volume}
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        onChange={handleVolumeChange}
                                        style={volumeSliderStyles}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <small className="d-block mt-2 text-muted text-center" style={{ fontSize: '11px' }}>
                            {file.name} ({fileType === 'image' ? 'Image' : fileType === 'video' ? 'Video' : 'Audio'})
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000000 !important;
          cursor: pointer;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000000 !important;
          cursor: pointer;
          border: none;
        }
        
        input[type="range"]::-ms-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000000 !important;
          cursor: pointer;
          border: none;
        }
        
        input[type="range"]:focus {
          outline: none;
        }
        
        textarea {
          resize: none;
        }
      `}</style>
    </>
  )
}

export default Upload