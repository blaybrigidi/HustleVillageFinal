const buyerService = require('../services/buyerService');

/**
 * View all available services
 * Returns all services with seller information
 */
const viewAllServices = async (req, res) => {
  try {
    const services = await buyerService.getAllServices();
    
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

module.exports = {
  viewAllServices
};

