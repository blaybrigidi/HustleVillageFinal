import { Shield, HelpCircle, Mail } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function SellerProfile() {
  return (
    <>
      <DashboardHeader 
        title="Profile & Support" 
        subtitle="Manage your seller profile and get help when you need it"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" defaultValue="John Doe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <div className="flex items-center gap-2">
                  <Input id="email" defaultValue="john.doe@university.edu" disabled />
                  <Badge variant="default" className="shrink-0 gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+233 24 123 4567" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea 
                  id="bio" 
                  rows={4}
                  defaultValue="Experienced designer specializing in web and brand identity. Passionate about helping businesses grow through great design."
                  placeholder="Tell buyers about yourself and your expertise..."
                />
              </div>

              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Need help with your seller account or have questions about bookings and payments?
                </p>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    View FAQ & Help Center
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent-light/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Common Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="text-foreground hover:text-primary transition-colors">
                      How does the escrow payment system work?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:text-primary transition-colors">
                      When will I receive payment for completed bookings?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:text-primary transition-colors">
                      How do I handle disputes with buyers?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:text-primary transition-colors">
                      Can I edit my services after publishing?
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
