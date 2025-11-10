const hustlerService = require('../services/hustlerService');

/**
 * Get all delete requests (admin only)
 * Query param: status (optional) - filter by pending, approved, or denied
 */
const getDeleteRequests = async (req, res) => {
  try {
    // TODO: Add admin authentication check
    // For now, anyone authenticated can view (you should add admin role check)
    const status = req.query.status || null;

    const requests = await hustlerService.getDeleteRequests(status);

    res.status(200).json({
      success: true,
      message: 'Delete requests retrieved successfully',
      data: requests,
      count: requests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Approve delete request - admin only
 * request_id from URL params, admin_id from req.user.id
 */
const approveDeleteRequest = async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const admin_id = req.user.id;
    if (!admin_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const request_id = req.params.id;
    if (!request_id) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }

    const { admin_comment } = req.body;

    const approvalData = {
      request_id,
      status: 'approved',
      admin_id,
      admin_comment: admin_comment || null
    };

    const result = await hustlerService.processDeleteRequest(approvalData);

    res.status(200).json({
      success: true,
      message: 'Delete request approved successfully. Service has been deleted.',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ||
                       error.message.includes('already') ||
                       error.message.includes('must be')
                       ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Deny delete request - admin only
 * request_id from URL params, admin_id from req.user.id
 */
const denyDeleteRequest = async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const admin_id = req.user.id;
    if (!admin_id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const request_id = req.params.id;
    if (!request_id) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }

    const { admin_comment } = req.body;

    const approvalData = {
      request_id,
      status: 'denied',
      admin_id,
      admin_comment: admin_comment || null
    };

    const result = await hustlerService.processDeleteRequest(approvalData);

    res.status(200).json({
      success: true,
      message: 'Delete request denied successfully.',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ||
                       error.message.includes('already') ||
                       error.message.includes('must be')
                       ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getDeleteRequests,
  approveDeleteRequest,
  denyDeleteRequest
};

