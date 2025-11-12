import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/services/ServiceCard";
import { toast } from "sonner";

interface Seller {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  is_verified: boolean;
  bio: string | null;
  created_at: string;
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

interface Stats {
  totalServices: number;
  completedOrders: number;
  totalReviews: number;
  averageRating: number;
}

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    completedOrders: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSellerProfile();
    }
  }, [id]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);

      // Fetch seller details
      const { data: sellerData, error: sellerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Fetch seller's services
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_listings')
        .select('*')
        .eq('seller_id', id)
        .eq('is_active', true);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch reviews
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
        .eq('reviewee_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData as any || []);

      // Fetch completed orders count
      const { count: completedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', id)
        .eq('status', 'completed');

      // Calculate stats
      const totalServices = servicesData?.length || 0;
      const completedOrders = completedCount || 0;
      const totalReviews = reviewsData?.length || 0;
      const averageRating = totalReviews > 0
        ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;

      setStats({
        totalServices,
        completedOrders,
        totalReviews,
        averageRating,
      });
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      toast.error('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-32 w-full mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Seller not found</h2>
            <Button onClick={() => navigate('/services')}>Browse Services</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        {/* Cover Banner */}
        <div className="h-64 bg-gradient-to-r from-primary/20 to-secondary/20"></div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-24 mb-8">
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-32 h-32 border-4 border-background">
                  <AvatarImage src={seller.profile_image_url || undefined} />
                  <AvatarFallback className="text-4xl">
                    {seller.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{seller.full_name}</h1>
                    {seller.is_verified && (
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    )}
                  </div>

                  {seller.bio && (
                    <p className="text-muted-foreground mb-4">{seller.bio}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Member since {new Date(seller.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-6 mb-4">
                    <div>
                      <div className="text-2xl font-bold">{stats.totalServices}</div>
                      <div className="text-sm text-muted-foreground">Services</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.completedOrders}</div>
                      <div className="text-sm text-muted-foreground">Completed Orders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.totalReviews}</div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                  </div>

                  {/* Overall Rating */}
                  {stats.totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(stats.averageRating)
                                ? 'fill-primary text-primary'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Services Section */}
          {services.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Services by {seller.full_name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    title={service.title}
                    description={service.description}
                    price={service.price}
                    pricingType={service.pricing_type}
                    imageUrls={service.image_urls}
                    sellerName={service.seller_name}
                    sellerVerified={service.seller_verified}
                    averageRating={service.average_rating}
                    reviewCount={service.review_count}
                    category={service.category}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
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
                  </Card>
                ))}
              </div>
            </div>
          )}

          {services.length === 0 && reviews.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                This seller hasn't listed any services yet.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerProfile;
