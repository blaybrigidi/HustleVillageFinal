// Buyer service - handles buyer-related business logic
const supabase = require('../../config/database');

/**
 * Get all services with seller information
 * Returns services with title, description, categories, price, and seller name
 */
const getAllServices = async () => {
  try {
    // First, try to fetch services with a join to users table
    // Try different join syntaxes depending on foreign key setup
    let services, error;
    
    const result1 = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        category,
        price,
        pricing_type,
        image_urls,
        seller_id,
        created_at,
        seller:users!seller_id (
          id,
          full_name,
          email
        )
      `)
      .eq('is_deleted', false)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    services = result1.data;
    error = result1.error;

    // If join fails, fetch services and sellers separately
    if (error) {
      console.log('Join failed, fetching services and sellers separately...');
      
      // Fetch all services (exclude deleted services)
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, title, description, category, price, pricing_type, image_urls, seller_id, created_at')
        .eq('is_deleted', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (servicesError) {
        throw new Error(`Failed to fetch services: ${servicesError.message}`);
      }

      if (!servicesData || servicesData.length === 0) {
        return [];
      }

      // Get unique seller IDs
      const sellerIds = [...new Set(servicesData.map(s => s.seller_id).filter(Boolean))];
      
      // Fetch sellers
      const { data: sellersData, error: sellersError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', sellerIds);

      if (sellersError) {
        console.error('Error fetching sellers:', sellersError);
      }

      // Create a map of sellerId to seller info
      const sellersMap = {};
      if (sellersData) {
        sellersData.forEach(seller => {
          sellersMap[seller.id] = seller;
        });
      }

      // Combine services with seller information
      services = servicesData.map(service => ({
        ...service,
        seller: sellersMap[service.seller_id] || null
      }));
    }

    // Transform the data to flatten the seller information
    const servicesWithSeller = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      pricing_type: service.pricing_type || 'fixed',
      image_urls: service.image_urls || [],
      sellerId: service.seller_id,
      sellerName: service.seller?.full_name || service.seller?.name || 'Unknown Seller',
      sellerEmail: service.seller?.email || null,
      createdAt: service.created_at
    }));

    return servicesWithSeller;
  } catch (error) {
    throw new Error(`Error fetching services: ${error.message}`);
  }
};

module.exports = {
  getAllServices
};

