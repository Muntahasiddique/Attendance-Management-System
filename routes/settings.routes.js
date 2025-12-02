const router = require('express').Router();
const Settings = require('../models/Settings');

// Get current settings
router.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.post('/api/settings', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.singleton;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;
    
    let settings = await Settings.findOneAndUpdate(
      { singleton: true },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Reset to defaults
router.post('/api/settings/reset', async (req, res) => {
  try {
    await Settings.deleteOne({ singleton: true });
    const settings = await Settings.create({ singleton: true });
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;
