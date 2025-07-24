import { Router } from 'express';
import { 
  cloneCalculator, 
  getUserCalculators, 
  getUserCalculator, 
  updateUserCalculator, 
  getCalculatorTemplates, 
  getCalculatorTemplate,
  deleteUserCalculator,
  getUserAnalytics,
  getUserQuotes
} from '../shared/supabase';

const router = Router();

// Get all calculator templates (for the "Add Calculator" modal)
router.get('/templates', async (req, res) => {
  try {
    const templates = await getCalculatorTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch calculator templates' });
  }
});

// Get specific calculator template by slug
router.get('/templates/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const template = await getCalculatorTemplate(slug);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch calculator template' });
  }
});

// Get user's calculators
router.get('/user-calculators/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const calculators = await getUserCalculators(userId);
    res.json(calculators);
  } catch (error) {
    console.error('Error fetching user calculators:', error);
    res.status(500).json({ error: 'Failed to fetch user calculators' });
  }
});

// Get specific user calculator
router.get('/user-calculators/:userId/:slug', async (req, res) => {
  try {
    const { userId, slug } = req.params;
    const calculator = await getUserCalculator(userId, slug);
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator not found' });
    }
    
    res.json(calculator);
  } catch (error) {
    console.error('Error fetching user calculator:', error);
    res.status(500).json({ error: 'Failed to fetch user calculator' });
  }
});

// Clone a calculator template for a user
router.post('/clone-calculator', async (req, res) => {
  try {
    const { userId, templateId } = req.body;
    
    if (!userId || !templateId) {
      return res.status(400).json({ error: 'userId and templateId are required' });
    }
    
    const clonedCalculator = await cloneCalculator(userId, templateId);
    
    if (!clonedCalculator) {
      return res.status(500).json({ error: 'Failed to clone calculator' });
    }
    
    res.json(clonedCalculator);
  } catch (error) {
    console.error('Error cloning calculator:', error);
    res.status(500).json({ error: 'Failed to clone calculator' });
  }
});

// Update user calculator
router.put('/user-calculators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await updateUserCalculator(id, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update calculator' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating calculator:', error);
    res.status(500).json({ error: 'Failed to update calculator' });
  }
});

// Update calculator configuration
router.post('/update-calculator-config', async (req, res) => {
  try {
    const { calculatorId, config, userId } = req.body;
    
    if (!calculatorId || !config || !userId) {
      return res.status(400).json({ error: 'calculatorId, config, and userId are required' });
    }
    
    const success = await updateUserCalculator(calculatorId, { 
      config,
      customBranding: config
    });
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update calculator configuration' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating calculator config:', error);
    res.status(500).json({ error: 'Failed to update calculator configuration' });
  }
});

// Delete user calculator
router.delete('/user-calculators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const success = await deleteUserCalculator(id, userId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete calculator' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting calculator:', error);
    res.status(500).json({ error: 'Failed to delete calculator' });
  }
});

// Get user analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await getUserAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user quotes/leads
router.get('/quotes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const quotes = await getUserQuotes(userId);
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

export default router;