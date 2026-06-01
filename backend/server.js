const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookiesParser = require('cookie-parser');
const jnfRoutes = require('./routes/jnf');
const rateLimit  = require('express-rate-limit');
const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://t-p-ruby.vercel.app'
  ],
  credentials: true
}));

// Strict limit on login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                    // max 10 attempts per IP
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please slow down.' },
});

app.use('/api/jnf/admin/login', loginLimiter);
app.use('/api/jnf', apiLimiter);


app.use(express.json());
app.use(cookiesParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/jnf', jnfRoutes);

app.get('/', (req, res) => res.send('JNF Portal API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));