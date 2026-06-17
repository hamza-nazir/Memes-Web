import ReactDom from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import Context from './hooks/Context.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-toastify/dist/ReactToastify.css';

ReactDom.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Context>
    <App />
  </Context>
  </BrowserRouter>
)
