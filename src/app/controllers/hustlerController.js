const hustlerService = require('../services/hustlerService');

/**
 * Create a new service
 * Expects: title, description, category, price, pricing_type, and optionally image_urls
 * sellerId is obtained from req.user.id (set by authentication middleware)
 */
const createService = async (req, res) => {
  try {
    // Get sellerId from authenticated user (set by auth middleware)
    const seller_id = req.user.id;
    if (!seller_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const {
      title,
      description,
      category,
      price,
      pricing_type,
      image_urls // Array of base64 encoded images or image URLs
    } = req.body;

    // Validate required fields (sellerId is no longer required in body)
    if (!title || !description || !category || price === undefined || !pricing_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category, price, and pricing_type are required'
      });
    }

    const serviceData = {
      seller_id, // From req.user.id
      title,
      description,
      category,
      price: parseFloat(price),
      pricing_type,
      image_urls
    };

    const newService = await hustlerService.createService(serviceData);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });
  } catch (error) {
    // Determine appropriate status code
    const statusCode = error.message.includes('Invalid') || 
                       error.message.includes('Missing') ||
                       error.message.includes('must be') 
                       ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }

};


module.exports = {
  createService
};