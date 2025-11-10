const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const buyerRoutes = require('./buyerRoutes');
const hustlerRoutes = require('./hustlerRoutes');
const adminRoutes = require('./adminRoutes');
// const exampleRoutes = require('./example.routes');

// Route definitions
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to HustleVillage API',
    status: 'Server is running'
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/api/auth', authRoutes);
router.use('/api/buyer', buyerRoutes);
router.use('/api/hustler', hustlerRoutes);
router.use('/api/admin', adminRoutes);

// router.use('/api/example', exampleRoutes);

module.exports = router;

