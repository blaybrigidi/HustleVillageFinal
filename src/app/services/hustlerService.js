// Hustler service - handles hustler-related business logic
const supabase = require('../../config/database');
const supabaseAdmin = require('../../config/database').supabaseAdmin;

// Enum values
const CATEGORIES = ['food_baking', 'design_creative', 'tutoring', 'beauty_hair', 'events_music', 'tech_dev'];
const PRICING_TYPES = ['fixed', 'hourly', 'negotiable'];

/**
 * Upload image to Supabase Storage
 * @param {Buffer|string} imageData - Image data (buffer or base64)
 * @param {string} fileName - Name of the file
 * @returns {Promise<string>} Public URL of the uploaded image
 */
const uploadImage = async (imageData, fileName) => {
  try {
    // If imageData is base64, convert it to buffer
    let buffer;
    if (typeof imageData === 'string') {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageData.includes(',') 
        ? imageData.split(',')[1] 
        : imageData;
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = imageData;
    }

    // Generate unique file name
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = `services/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('service-images') // Make sure this bucket exists in Supabase
      .upload(filePath, buffer, {
        contentType: 'image/jpeg', // Adjust based on image type
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('service-images')
      .getPublicUrl(filePath);

    // urlData contains { publicUrl: string }
    return urlData.publicUrl;
  } catch (error) {
    throw new Error(`Image upload error: ${error.message}`);
  }
};

/**
 * Create a new service
 * @param {Object} serviceData - Service data
 * @param {string} serviceData.seller_id - ID of the seller (user)
 * @param {string} serviceData.title - Service title
 * @param {string} serviceData.description - Service description
 * @param {string} serviceData.category - Service category (enum)
 * @param {number} serviceData.price - Service price
 * @param {string} serviceData.pricing_type - Pricing type (enum)
 * @param {Array<string>} serviceData.image_urls - Optional array of image URLs (can be base64 or already uploaded URLs)
 * @returns {Promise<Object>} Created service
 */
const createService = async (serviceData) => {
  const {
    seller_id,
    title,
    description,
    category,
    price,
    pricing_type,
    image_urls
  } = serviceData;

  // Validate required fields (sellerId is now always provided from authenticated user)
  if (!seller_id) {
    throw new Error('Seller ID is required');
  }

  if (!title || !description || !category || price === undefined || !pricing_type) {
    throw new Error('Missing required fields: title, description, category, price, and pricing_type are required');
  }

  // Validate category enum
  if (!CATEGORIES.includes(category.toLowerCase())) {
    throw new Error(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
  }

  // Validate pricing_type enum
  if (!PRICING_TYPES.includes(pricing_type.toLowerCase())) {
    throw new Error(`Invalid pricing_type. Must be one of: ${PRICING_TYPES.join(', ')}`);
  }

  // Validate price is a positive number
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Price must be a positive number');
  }

  // Validate seller exists (use admin client to bypass RLS if needed)
  const dbClient = supabaseAdmin || supabase;
  const { data: seller, error: sellerError } = await dbClient
    .from('users')
    .select('id')
    .eq('id', seller_id)
    .single();

  if (sellerError || !seller) {
    throw new Error('Invalid seller_id: Seller does not exist');
  }

  let uploadedImageUrls = [];

  // Handle image upload if provided
  if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
    try {
      // Check if images are base64 (need upload) or already URLs (no upload needed)
      for (let i = 0; i < image_urls.length; i++) {
        const imageData = image_urls[i];
        
        // If it's a base64 string, upload it
        if (imageData.startsWith('data:') || !imageData.startsWith('http')) {
          const fileName = `service-${Date.now()}-${i}.jpg`;
          const uploadedUrl = await uploadImage(imageData, fileName);
          uploadedImageUrls.push(uploadedUrl);
        } else {
          // It's already a URL, just use it
          uploadedImageUrls.push(imageData);
        }
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      // Continue without images if upload fails
      // Uncomment the next line if you want to require successful image upload
      // throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  // Create service in database (use admin client to bypass RLS if needed)
  const now = new Date().toISOString();
  const { data: newService, error: createError } = await dbClient
    .from('services')
    .insert([
      {
        seller_id: seller_id,
        title: title.trim(),
        description: description.trim(),
        category: category.toLowerCase(),
        price: parseFloat(price),
        pricing_type: pricing_type.toLowerCase(),
        image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        created_at: now,
        updated_at: now
      }
    ])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create service: ${createError.message}`);
  }

  return newService;
};

/**
 * Update an existing service
 * @param {Object} serviceData - Service data
 * @param {string} serviceData.service_id - ID of the service to update
 * @param {string} serviceData.seller_id - ID of the seller (user) - used for authorization
 * @param {string} serviceData.title - Service title
 * @param {string} serviceData.description - Service description
 * @param {string} serviceData.category - Service category (enum)
 * @param {number} serviceData.price - Service price
 * @param {string} serviceData.pricing_type - Pricing type (enum)
 * @param {Array<string>} serviceData.image_urls - Optional array of image URLs (can be base64 or already uploaded URLs)
 * @returns {Promise<Object>} Updated service
 */
const updateService = async (serviceData) => {
  const {
    service_id,
    seller_id,
    title,
    description,
    category,
    price,
    pricing_type,
    image_urls
  } = serviceData;

  // Validate required fields
  if (!service_id) {
    throw new Error('Service ID is required');
  }

  if (!seller_id) {
    throw new Error('Seller ID is required');
  }

  if (!title || !description || !category || price === undefined || !pricing_type) {
    throw new Error('Missing required fields: title, description, category, price, and pricing_type are required');
  }

  // Validate category enum
  if (!CATEGORIES.includes(category.toLowerCase())) {
    throw new Error(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
  }

  // Validate pricing_type enum
  if (!PRICING_TYPES.includes(pricing_type.toLowerCase())) {
    throw new Error(`Invalid pricing_type. Must be one of: ${PRICING_TYPES.join(', ')}`);
  }

  // Validate price is a positive number
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Price must be a positive number');
  }

  // Use admin client to bypass RLS if needed
  const dbClient = supabaseAdmin || supabase;

  // First, verify that the service exists and belongs to the seller
  const { data: existingService, error: serviceError } = await dbClient
    .from('services')
    .select('id, seller_id')
    .eq('id', service_id)
    .single();

  if (serviceError || !existingService) {
    throw new Error('Service not found');
  }

  // Verify that the service belongs to the authenticated seller
  if (existingService.seller_id !== seller_id) {
    throw new Error('Unauthorized: You can only edit your own services');
  }

  let uploadedImageUrls = [];

  // Handle image upload if provided
  if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
    try {
      // Check if images are base64 (need upload) or already URLs (no upload needed)
      for (let i = 0; i < image_urls.length; i++) {
        const imageData = image_urls[i];
        
        // If it's a base64 string, upload it
        if (imageData.startsWith('data:') || !imageData.startsWith('http')) {
          const fileName = `service-${Date.now()}-${i}.jpg`;
          const uploadedUrl = await uploadImage(imageData, fileName);
          uploadedImageUrls.push(uploadedUrl);
        } else {
          // It's already a URL, just use it
          uploadedImageUrls.push(imageData);
        }
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      // Continue without images if upload fails
    }
  }

  // Update service in database
  const now = new Date().toISOString();
  const updateData = {
    title: title.trim(),
    description: description.trim(),
    category: category.toLowerCase(),
    price: parseFloat(price),
    pricing_type: pricing_type.toLowerCase(),
    updated_at: now
  };

  // Only update image_urls if provided
  if (image_urls && Array.isArray(image_urls)) {
    updateData.image_urls = uploadedImageUrls.length > 0 ? uploadedImageUrls : null;
  }

  const { data: updatedService, error: updateError } = await dbClient
    .from('services')
    .update(updateData)
    .eq('id', service_id)
    .eq('seller_id', seller_id) // Extra safety check
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update service: ${updateError.message}`);
  }

  return updatedService;
};

/**
 * Request service deletion
 * Creates a delete request record that requires admin approval
 * @param {Object} requestData - Delete request data
 * @param {string} requestData.service_id - ID of the service to delete
 * @param {string} requestData.seller_id - ID of the seller (user) - used for authorization
 * @param {string} requestData.reason - Optional reason for deletion
 * @returns {Promise<Object>} Delete request record
 */
const requestServiceDeletion = async (requestData) => {
  const {
    service_id,
    seller_id,
    reason
  } = requestData;

  // Validate required fields
  if (!service_id) {
    throw new Error('Service ID is required');
  }

  if (!seller_id) {
    throw new Error('Seller ID is required');
  }

  // Use admin client to bypass RLS if needed
  const dbClient = supabaseAdmin || supabase;

  console.log('Looking for service:', service_id);
  console.log('Seller ID:', seller_id);

  // First, verify that the service exists and belongs to the seller
  // Try to get the service without filtering by seller first to see if it exists at all
  const { data: existingService, error: serviceError } = await dbClient
    .from('services')
    .select('id, seller_id, title, is_active, is_deleted')
    .eq('id', service_id)
    .single();

  if (serviceError) {
    console.error('Error fetching service:', serviceError);
    // Provide more detailed error message
    if (serviceError.code === 'PGRST116') {
      throw new Error(`Service not found with ID: ${service_id}`);
    }
    throw new Error(`Database error: ${serviceError.message}`);
  }

  if (!existingService) {
    throw new Error(`Service not found with ID: ${service_id}`);
  }

  // Verify that the service belongs to the authenticated seller
  console.log('Checking ownership:', {
    service_seller_id: existingService.seller_id,
    authenticated_seller_id: seller_id,
    match: existingService.seller_id === seller_id
  });

  if (existingService.seller_id !== seller_id) {
    throw new Error(`Unauthorized: Service belongs to seller ${existingService.seller_id}, but you are ${seller_id}`);
  }

  // Check if service is already deleted
  if (existingService.is_deleted) {
    throw new Error('Service is already deleted');
  }

  // Check if there's already a pending delete request for this service
  const { data: existingRequest, error: requestCheckError } = await dbClient
    .from('service_delete_requests')
    .select('id, status')
    .eq('service_id', service_id)
    .eq('status', 'pending')
    .single();

  if (existingRequest && !requestCheckError) {
    throw new Error('A pending delete request already exists for this service');
  }

  // Create delete request record
  const now = new Date().toISOString();
  const { data: deleteRequest, error: createError } = await dbClient
    .from('service_delete_requests')
    .insert([
      {
        service_id: service_id,
        seller_id: seller_id,
        reason: reason || null,
        status: 'pending',
        requested_at: now
      }
    ])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create delete request: ${createError.message}`);
  }

  // TODO: Notify admins (email, dashboard alert, etc.)
  console.log(`Delete request created for service ${service_id} by seller ${seller_id}`);

  return {
    deleteRequest,
    service: {
      id: existingService.id,
      title: existingService.title
    }
  };
};

/**
 * Get all delete requests (for admin)
 * @param {string} status - Filter by status (pending, approved, denied)
 * @returns {Promise<Array>} List of delete requests
 */
const getDeleteRequests = async (status = null) => {
  const dbClient = supabaseAdmin || supabase;

  let query = dbClient
    .from('service_delete_requests')
    .select(`
      *,
      service:services (
        id,
        title,
        description,
        seller_id,
        created_at
      ),
      seller:users!service_delete_requests_seller_id_fkey (
        id,
        email,
        full_name
      )
    `)
    .order('requested_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: requests, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch delete requests: ${error.message}`);
  }

  return requests;
};

/**
 * Approve or deny a delete request (admin only)
 * @param {Object} approvalData - Approval data
 * @param {string} approvalData.request_id - ID of the delete request
 * @param {string} approvalData.status - 'approved' or 'denied'
 * @param {string} approvalData.admin_id - ID of the admin approving/denying
 * @param {string} approvalData.admin_comment - Optional comment from admin
 * @returns {Promise<Object>} Updated delete request and service status
 */
const processDeleteRequest = async (approvalData) => {
  const {
    request_id,
    status,
    admin_id,
    admin_comment
  } = approvalData;

  // Validate required fields
  if (!request_id) {
    throw new Error('Request ID is required');
  }

  if (!status || !['approved', 'denied'].includes(status)) {
    throw new Error('Status must be either "approved" or "denied"');
  }

  if (!admin_id) {
    throw new Error('Admin ID is required');
  }

  // Use admin client to bypass RLS
  const dbClient = supabaseAdmin || supabase;

  // Get the delete request
  const { data: deleteRequest, error: requestError } = await dbClient
    .from('service_delete_requests')
    .select('*')
    .eq('id', request_id)
    .single();

  if (requestError || !deleteRequest) {
    throw new Error('Delete request not found');
  }

  if (deleteRequest.status !== 'pending') {
    throw new Error(`Delete request is already ${deleteRequest.status}`);
  }

  const now = new Date().toISOString();

  // Update delete request status
  const { data: updatedRequest, error: updateError } = await dbClient
    .from('service_delete_requests')
    .update({
      status: status,
      admin_id: admin_id,
      admin_comment: admin_comment || null,
      processed_at: now
    })
    .eq('id', request_id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update delete request: ${updateError.message}`);
  }

  // If approved, soft delete the service
  if (status === 'approved') {
    const { data: deletedService, error: deleteError } = await dbClient
      .from('services')
      .update({
        is_deleted: true,
        is_active: false,
        deleted_at: now
      })
      .eq('id', deleteRequest.service_id)
      .select()
      .single();

    if (deleteError) {
      throw new Error(`Failed to delete service: ${deleteError.message}`);
    }

    // TODO: Notify user that their service deletion was approved
    console.log(`Service ${deleteRequest.service_id} deleted by admin ${admin_id}`);

    return {
      deleteRequest: updatedRequest,
      service: deletedService,
      action: 'deleted'
    };
  } else {
    // TODO: Notify user that their service deletion was denied
    console.log(`Service deletion request ${request_id} denied by admin ${admin_id}`);

    return {
      deleteRequest: updatedRequest,
      action: 'denied'
    };
  }
};

/**
 * Get all services for a specific seller
 * @param {string} seller_id - ID of the seller
 * @returns {Promise<Array>} List of services
 */
const getSellerServices = async (seller_id) => {
  if (!seller_id) {
    throw new Error('Seller ID is required');
  }

  const dbClient = supabaseAdmin || supabase;

  const { data: services, error } = await dbClient
    .from('services')
    .select('id, title, description, category, price, pricing_type, seller_id, is_active, is_deleted, created_at, updated_at')
    .eq('seller_id', seller_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`);
  }

  return services || [];
};

/**
 * Toggle service status (pause/unpause)
 * Toggles the is_active flag for a service
 * @param {Object} toggleData - Toggle data
 * @param {string} toggleData.service_id - ID of the service to toggle
 * @param {string} toggleData.seller_id - ID of the seller (user) - used for authorization
 * @returns {Promise<Object>} Updated service
 */
const toggleServiceStatus = async ({ service_id, seller_id }) => {
  // Validate required fields
  if (!service_id) {
    throw new Error('Service ID is required');
  }

  if (!seller_id) {
    throw new Error('Seller ID is required');
  }

  // Use admin client to bypass RLS if needed
  const dbClient = supabaseAdmin || supabase;

  // Fetch the service to verify it exists and belongs to the seller
  const { data: service, error: fetchError } = await dbClient
    .from('services')
    .select('id, seller_id, is_active, is_deleted')
    .eq('id', service_id)
    .single();

  if (fetchError) {
    console.error('Error fetching service:', fetchError);
    if (fetchError.code === 'PGRST116') {
      throw new Error(`Service not found with ID: ${service_id}`);
    }
    throw new Error(`Database error: ${fetchError.message}`);
  }

  if (!service) {
    throw new Error(`Service not found with ID: ${service_id}`);
  }

  // Verify that the service belongs to the authenticated seller
  if (service.seller_id !== seller_id) {
    throw new Error('Unauthorized: You can only toggle status of your own services');
  }

  // Check if service is deleted
  if (service.is_deleted) {
    throw new Error('Cannot toggle status of a deleted service');
  }

  // Toggle the is_active flag
  const now = new Date().toISOString();
  const { data: updatedService, error: updateError } = await dbClient
    .from('services')
    .update({
      is_active: !service.is_active,
      updated_at: now
    })
    .eq('id', service_id)
    .eq('seller_id', seller_id) // Extra safety check
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to toggle service status: ${updateError.message}`);
  }

  return updatedService;
};


module.exports = {
  createService,
  updateService,
  requestServiceDeletion,
  getDeleteRequests,
  processDeleteRequest,
  getSellerServices,
  toggleServiceStatus,
  CATEGORIES,
  PRICING_TYPES
};