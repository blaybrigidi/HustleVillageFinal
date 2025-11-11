import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ServiceCard } from "@/components/services/ServiceCard";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  pricing_type: string;
  category: string;
  image_urls: string[];
  seller_id: string;
  created_at: string;
}

interface Seller {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  is_verified: boolean;
  created_at: string;
  bio: string | null;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer: {
    full_name: string;
    profile_image_url: string | null;
  };
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [sellerServices, setSellerServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);

      // Fetch service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Fetch seller details
      const { data: sellerData, error: sellerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', serviceData.seller_id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Fetch reviews for this seller
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          reviewer:reviewer_id (
            full_name,
            profile_image_url
          )
        `)
        .eq('reviewee_id', serviceData.seller_id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData as any || []);

      // Calculate average rating
      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length;
        setAverageRating(avg);
      }

      // Fetch related services (same category, different seller)
      const { data: relatedData } = await supabase
        .from('service_listings')
        .select('*')
        .eq('category', serviceData.category)
        .eq('is_active', true)
        .neq('seller_id', serviceData.seller_id)
        .limit(4);

      setRelatedServices(relatedData || []);

      // Fetch more services from this seller
      const { data: sellerServicesData } = await supabase
        .from('service_listings')
        .select('*')
        .eq('seller_id', serviceData.seller_id)
        .eq('is_active', true)
        .neq('id', id)
        .limit(4);

      setSellerServices(sellerServicesData || []);

      // Check if user can review (has completed booking)
      if (user) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id')
          .eq('service_id', id)
          .eq('buyer_id', user.id)
          .eq('status', 'completed')
          .maybeSingle();

        setCanReview(!!bookingData);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, pricingType: string) => {
    if (pricingType === 'hourly') {
      return `GH₵${price}/hr`;
    } else if (pricingType === 'custom') {
      return `From GH₵${price}`;
    }
    return `GH₵${price}`;
  };

  const getCategoryLabel = (categoryId: string) => {
    const categories: Record<string, string> = {
      food_baking: "Food & Baking",
      design_creative: "Design & Creative",
      tutoring: "Tutoring & Academics",
      beauty_hair: "Beauty & Hair",
      events_music: "Events & Music",
      tech_dev: "Tech & Development",
    };
    return categories[categoryId] || categoryId;
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    // Navigate to booking page (to be implemented)
    toast.info('Booking functionality coming soon!');
  };

  const handleMessageSeller = () => {
    if (!user) {
      toast.error('Please login to message sellers');
      navigate('/login');
      return;
    }
    toast.info('Messaging functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-96 w-full mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service || !seller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Service not found</h2>
            <Button onClick={() => navigate('/services')}>Browse Services</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = service.image_urls && service.image_urls.length > 0 
    ? service.image_urls 
    : ['/placeholder.svg'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/services')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={images[currentImageIndex]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                          idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Description Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">About This Service</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
              </Card>

              {/* Booking Details */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">What to Expect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Pricing Type</h3>
                    <p className="text-muted-foreground">
                      {service.pricing_type === 'hourly' && 'Hourly rate - Pay for the time you need'}
                      {service.pricing_type === 'fixed' && 'Fixed price - One-time payment'}
                      {service.pricing_type === 'custom' && 'Negotiable - Price may vary based on requirements'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Time</h3>
                    <p className="text-muted-foreground">Contact seller for delivery timeline</p>
                  </div>
                </div>
              </Card>

              {/* Reviews Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  {canReview && (
                    <Button onClick={() => toast.info('Review functionality coming soon!')}>
                      Write a Review
                    </Button>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to book!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                      <div className="flex items-center gap-2">
                        <Star className="w-8 h-8 fill-primary text-primary" />
                        <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.reviewer.profile_image_url || undefined} />
                              <AvatarFallback>
                                {review.reviewer.full_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold">{review.reviewer.full_name}</p>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-primary text-primary'
                                            : 'text-muted'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {review.review_text && (
                                <p className="text-muted-foreground">{review.review_text}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            {/* Right Column - Service Info Card */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-8">
                <div className="space-y-6">
                  {/* Service Title and Badge */}
                  <div>
                    <Badge variant="category" className="mb-3">{getCategoryLabel(service.category)}</Badge>
                    <h1 className="text-2xl font-bold mb-4">{service.title}</h1>
                    <div className="text-3xl font-bold text-primary mb-6">
                      {formatPrice(service.price, service.pricing_type)}
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="border-t border-b py-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={seller.profile_image_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {seller.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{seller.full_name}</p>
                          {seller.is_verified && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        {reviews.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/sellers/${seller.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleBookNow}>
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={handleMessageSeller}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Message Seller
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Related Services */}
          {sellerServices.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">More from this seller</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sellerServices.map((srv) => (
                  <ServiceCard key={srv.id} {...srv} id={srv.id} />
                ))}
              </div>
            </div>
          )}

          {relatedServices.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Similar services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedServices.map((srv) => (
                  <ServiceCard key={srv.id} {...srv} id={srv.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
