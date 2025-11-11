import { Card } from "@/components/ui/card";
import { Utensils, Palette, BookOpen, Scissors, Music, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const categoryIcons = {
  food_baking: Utensils,
  design_creative: Palette,
  tutoring: BookOpen,
  beauty_hair: Scissors,
  events_music: Music,
  tech_dev: Code,
};

const categoryLabels = {
  food_baking: "Food & Baking",
  design_creative: "Design & Creative",
  tutoring: "Tutoring & Academics",
  beauty_hair: "Beauty & Hair",
  events_music: "Events & Music",
  tech_dev: "Tech & Development",
};

const categoryDescriptions = {
  food_baking: "Homemade treats & meals",
  design_creative: "Graphics, art & more",
  tutoring: "Academic help & lessons",
  beauty_hair: "Styling & grooming",
  events_music: "DJs, planning & more",
  tech_dev: "Coding & IT services",
};

const categories = [
  "food_baking",
  "design_creative",
  "tutoring",
  "beauty_hair",
  "events_music",
  "tech_dev",
];

export const CategoryGrid = () => {
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((service) => {
        counts[service.category] = (counts[service.category] || 0) + 1;
      });
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          Explore Categories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((categoryId) => {
            const Icon = categoryIcons[categoryId as keyof typeof categoryIcons];
            const name = categoryLabels[categoryId as keyof typeof categoryLabels];
            const description = categoryDescriptions[categoryId as keyof typeof categoryDescriptions];
            const count = categoryCounts[categoryId] || 0;
            
            return (
              <Card 
                key={categoryId}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary group"
                onClick={() => navigate(`/services?category=${categoryId}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary transition-colors">
                    <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-card-foreground">
                      {name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                    <p className="text-xs text-primary font-medium mt-2">
                      {count} {count === 1 ? 'service' : 'services'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
