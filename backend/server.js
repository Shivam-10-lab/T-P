const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const jnfRoutes = require('./routes/jnf');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/jnf', jnfRoutes);

app.get('/', (req, res) => res.send('JNF Portal API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));