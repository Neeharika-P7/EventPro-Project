'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge
} from '@/components/ui/shadcn';

import { useAppStore } from '@/store/useAppStore';

// ==========================================
// 1. LOGIN FORM
// ==========================================
export function LoginForm() {
  const { setCurrentPage, setCurrentUser, setNotifications } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setNotifications(data.notifications || []);
        toast.success(`Welcome back, ${data.user.name}!`);
        const page = data.user.role === 'ADMIN' ? 'admin-portal' : data.user.role === 'STAFF' ? 'staff-portal' : 'client-portal';
        setCurrentPage(page as any);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const quickLogin = (e: string, p: string, r: string) => {
    setEmail(e);
    setPassword(p);
    setRole(r);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('landing')}
              className="absolute left-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex justify-center mb-4 mt-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LogIn className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your EventPro account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select login role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <button
                onClick={() => setCurrentPage('register')}
                className="text-primary font-medium hover:underline"
              >
                Register here
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Demo Credentials</p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => quickLogin('admin@eventpro.com', 'admin123', 'ADMIN')}
                  className="w-full text-left p-2.5 rounded-lg border hover:bg-accent transition-colors text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Admin Access</span>
                    <Badge variant="secondary" className="text-[10px]">admin@eventpro.com</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Full management dashboard</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('priya@eventpro.com', 'staff123', 'STAFF')}
                  className="w-full text-left p-2.5 rounded-lg border hover:bg-accent transition-colors text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Staff Access</span>
                    <Badge variant="secondary" className="text-[10px]">priya@eventpro.com</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Event coordination portal</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('client@test.com', 'client123', 'CLIENT')}
                  className="w-full text-left p-2.5 rounded-lg border hover:bg-accent transition-colors text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Client Access</span>
                    <Badge variant="secondary" className="text-[10px]">client@test.com</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse events & manage bookings</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ==========================================
// 2. REGISTER FORM
// ==========================================
export function RegisterForm() {
  const { setCurrentPage, setCurrentUser } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'CLIENT', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        toast.success('Registration successful! Welcome to EventPro!');
        const page = data.user.role === 'STAFF' ? 'staff-portal' : 'client-portal';
        setCurrentPage(page as any);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('landing')}
              className="absolute left-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex justify-center mb-4 mt-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join EventPro and start planning amazing events</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email *</Label>
                <Input id="reg-email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone</Label>
                <Input id="reg-phone" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client - I want to book events</SelectItem>
                    <SelectItem value="STAFF">Staff - I am an event professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <div className="text-center text-sm mt-4">
              <span className="text-muted-foreground">Already have an account? </span>
              <button onClick={() => setCurrentPage('login')} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
