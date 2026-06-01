const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookiesParser = require('cookie-parser');
const jnfRoutes = require('./routes/jnf');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://t-p-ruby.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookiesParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/jnf', jnfRoutes);

app.get('/', (req, res) => res.send('JNF Portal API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));