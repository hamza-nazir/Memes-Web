import React, { useState, useContext } from 'react';
import {  Dialog,  DialogContent,  TextField,  Button,  Typography,  Divider,  Box,  IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../hooks/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../hooks/Context';
import { useEffect } from 'react';
const HomeDialog = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(MyContext);

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/login', form); // 🔥 login route
      setCurrentUser(res.data.user);
      toast.success("Login successfully");
      setOpen(false);
      navigate('/');
    } catch (err) {
      console.log(err);
      toast.error("Invalid credentials");
    }
  };

useEffect(() => {
  const hasShownDialog = localStorage.getItem("hasShownLoginDialog");
  if (hasShownDialog) return;

  api.get('/current-user').then((res) => {
    if (!res.data.user) {
      setOpen(true);
      localStorage.setItem("hasShownLoginDialog", "true");
    }
  });
}, []);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACK_END}/auth/google`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ position: 'relative' }}>

        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: 'black'
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: 2 }}>
          
          {/* Title */}
          <Typography
            variant="h5"
            sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}
          >
            Login
          </Typography>

          {/* Username */}
          <TextField
            fullWidth
            placeholder="Enter username"
            name="username"
            value={form.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            fullWidth
            placeholder="Enter password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {/* Submit */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: 'black',
              color: 'white',
              py: 1.2,
              '&:hover': { bgcolor: '#222' },
              mb: 2
            }}
            onClick={handleSubmit}
          >
            Login
          </Button>

          {/* OR Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography sx={{ mx: 1, color: 'gray', fontSize: 14 }}>
              OR
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Google Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={{
              py: 1.2,
              color: 'black',
              borderColor: 'black',
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': {
                borderColor: 'black',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <img src="/logo.png" alt="Google" width="20" />
            Continue with Google
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HomeDialog;