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

module.exports = {
  createService,
  CATEGORIES,
  PRICING_TYPES
};