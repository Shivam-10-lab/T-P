const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JNF = require('../models/JNF');
const auth = require('../middleware/auth');
require('dotenv').config();

// ── PUBLIC: Submit JNF ──────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const jnf = new JNF(req.body);
    await jnf.save();
    res.status(201).json({ message: 'JNF submitted successfully', id: jnf._id });
  } catch (err) {
    res.status(400).json({ message: 'Submission failed', error: err.message });
  }
});

// ── ADMIN: Login ────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (
    email !== process.env.ADMIN_EMAIL || !(await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH))
  ) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.cookie('admin_token', token, {
      httpOnly: true,
      secure: true,          // required for cross-site
      sameSite: 'none',      // required for cross-site (Vercel → Render)
      maxAge: 8 * 60 * 60 * 1000
  });
  res.json({ message: 'Login successful'});
});

// ── ADMIN: Get all JNFs ─────────────────────────────────────────
router.get('/admin/all', auth, async (req, res) => {
  try {
    const jnfs = await JNF.find().sort({ submittedAt: -1 });
    res.json(jnfs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching JNFs' });
  }
});

// ── ADMIN: Get single JNF ───────────────────────────────────────
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const jnf = await JNF.findById(req.params.id);
    if (!jnf) return res.status(404).json({ message: 'JNF not found' });
    res.json(jnf);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching JNF' });
  }
});

// ── ADMIN: Update status ────────────────────────────────────────
router.patch('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const jnf = await JNF.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: 'Status updated', jnf });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

// ── ADMIN: Delete JNF ───────────────────────────────────────────
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    await JNF.findByIdAndDelete(req.params.id);
    res.json({ message: 'JNF deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting JNF' });
  }
});

router.post('/admin/logout', (req, res) => {
 res.clearCookie('admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logged out' });
});

module.exports = router;