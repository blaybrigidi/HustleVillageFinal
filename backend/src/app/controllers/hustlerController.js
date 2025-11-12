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


/**
 * Update an existing service
 * Expects: service_id (in params), title, description, category, price, pricing_type, and optionally image_urls
 * seller_id is obtained from req.user.id (set by authentication middleware)
 */
const updateService = async (req, res) => {
  try {
    // Get seller_id from authenticated user (set by auth middleware)
    const seller_id = req.user.id;
    if (!seller_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get service_id from URL params
    const service_id = req.params.id || req.body.service_id;
    if (!service_id) {
      return res.status(400).json({
        success: false,
        error: 'Service ID is required'
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

    // Validate required fields
    if (!title || !description || !category || price === undefined || !pricing_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category, price, and pricing_type are required'
      });
    }

    const serviceData = {
      service_id,
      seller_id, // From req.user.id
      title,
      description,
      category,
      price: parseFloat(price),
      pricing_type,
      image_urls
    };

    const updatedService = await hustlerService.updateService(serviceData);

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    // Determine appropriate status code
    const statusCode = error.message.includes('Invalid') || 
                       error.message.includes('Missing') ||
                       error.message.includes('must be') ||
                       error.message.includes('not found') ||
                       error.message.includes('Unauthorized')
                       ? 400 : 500;
    
    // Unauthorized should be 403
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Request service deletion
 * Creates a delete request that requires admin approval
 * Expects: reason (optional) in body
 * service_id from URL params, seller_id from req.user.id
 */
const requestServiceDeletion = async (req, res) => {
  try {
    // Get seller_id from authenticated user (set by auth middleware)
    const seller_id = req.user.id;
    if (!seller_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get service_id from URL params
    const service_id = req.params.id;
    if (!service_id) {
      return res.status(400).json({
        success: false,
        error: 'Service ID is required'
      });
    }

    const { reason } = req.body;

    console.log('Delete request data:', {
      service_id,
      seller_id,
      reason
    });

    const requestData = {
      service_id,
      seller_id,
      reason: reason || null
    };

    const result = await hustlerService.requestServiceDeletion(requestData);

    res.status(201).json({
      success: true,
      message: 'Delete request submitted successfully. Awaiting admin approval.',
      data: {
        deleteRequest: result.deleteRequest,
        service: result.service
      }
    });
  } catch (error) {
    // Determine appropriate status code
    const statusCode = error.message.includes('Invalid') || 
                       error.message.includes('Missing') ||
                       error.message.includes('not found') ||
                       error.message.includes('already')
                       ? 400 : 
                       error.message.includes('Unauthorized')
                       ? 403 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all services for the authenticated seller
 */
const getMyServices = async (req, res) => {
  try {
    // Get seller_id from authenticated user (set by auth middleware)
    const seller_id = req.user.id;
    if (!seller_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const services = await hustlerService.getSellerServices(seller_id);

    res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      data: services,
      count: services.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Toggle service status (pause/unpause)
 * Toggles the is_active flag for a service
 * service_id from URL params, seller_id from req.user.id
 */
const toggleServiceStatus = async (req, res) => {
  try {
    // Get seller_id from authenticated user (set by auth middleware)
    const seller_id = req.user.id;
    if (!seller_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get service_id from URL params
    const service_id = req.params.id;
    if (!service_id) {
      return res.status(400).json({
        success: false,
        error: 'Service ID is required'
      });
    }

    const updatedService = await hustlerService.toggleServiceStatus({
      service_id,
      seller_id
    });

    res.status(200).json({
      success: true,
      message: `Service is now ${updatedService.is_active ? 'active' : 'paused'}`,
      data: updatedService
    });
  } catch (error) {
    // Determine appropriate status code
    const statusCode = error.message.includes('not found') ||
                       error.message.includes('Unauthorized') ||
                       error.message.includes('deleted')
                       ? 400 :
                       error.message.includes('Unauthorized')
                       ? 403 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createService,
  updateService,
  requestServiceDeletion,
  getMyServices,
  toggleServiceStatus
};