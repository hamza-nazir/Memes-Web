import { FiImage, FiVideo, FiMusic, FiHome, FiTrendingUp, FiCalendar, FiUser } from 'react-icons/fi'

export  const categories=[
    {id:'all',name:'Home'},
    {id:'image',name:'Images'},
    {id:'video',name:'Videos'},
    {id:'audios',name:'Audio'},
]

export const categoryIcons = {
    all: <FiHome className="me-2" />,
    image: <FiImage className="me-2" />,
    video: <FiVideo className="me-2" />,
    audios: <FiMusic className="me-2" />,
    trending: <FiTrendingUp className="me-2" />
  }