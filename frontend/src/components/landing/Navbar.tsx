import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Package, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserType } from "@/hooks/useUserType";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { canListServices } = useUserType();
  const navigate = useNavigate();

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">H</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Hustle Village</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#services" className="text-foreground hover:text-primary transition-colors">
              Browse Services
            </a>
            <a href="/#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {canListServices && (
                  <Button variant="outline" onClick={() => navigate('/list-service')}>
                    List a Service
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-services')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Services
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a href="/#services" className="text-foreground hover:text-primary transition-colors">
                Browse Services
              </a>
              <a href="/#how-it-works" className="text-foreground hover:text-primary transition-colors">
                How It Works
              </a>
              {user ? (
                <>
                  {canListServices && (
                    <Button variant="outline" className="w-full" onClick={() => navigate('/list-service')}>
                      List a Service
                    </Button>
                  )}
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/my-services')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Services
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/my-bookings')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      My Bookings
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/signup')}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
