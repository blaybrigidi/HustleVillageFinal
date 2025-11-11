import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'both'>('buyer');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName || !lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!email.endsWith('@ashesi.edu.gh')) {
      toast.error('Only @ashesi.edu.gh email addresses are allowed');
      return;
    }

    setLoading(true);

    // Store signup data in localStorage to use after email verification
    localStorage.setItem('signupData', JSON.stringify({
      email,
      firstName,
      lastName,
      phoneNumber,
      userType
    }));

    const { error } = await signIn(email);

    setLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to send verification email');
      return;
    }

    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Join Hustle Village with your Ashesi email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@ashesi.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>I want to:</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="buyer"
                    checked={userType === 'buyer'}
                    onChange={(e) => setUserType(e.target.value as 'buyer')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Find services (Buyer)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="seller"
                    checked={userType === 'seller'}
                    onChange={(e) => setUserType(e.target.value as 'seller')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Offer services (Hustler)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="both"
                    checked={userType === 'both'}
                    onChange={(e) => setUserType(e.target.value as 'both')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Both</span>
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending verification code...' : 'Sign up with Email'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => navigate('/login')}
            >
              Log in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
