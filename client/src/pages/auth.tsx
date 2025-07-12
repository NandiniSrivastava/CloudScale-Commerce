import { useState } from "react";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Cloud, Zap, Shield } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Cloud className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CloudScale Commerce</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground">
            Auto-Scaling E-commerce Platform
          </h2>
          
          <p className="text-muted-foreground text-lg">
            Experience the future of cloud commerce with real-time auto-scaling 
            and self-healing infrastructure powered by AWS.
          </p>
          
          <div className="space-y-4 pt-6">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm">Real-time auto-scaling based on user traffic</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Self-healing infrastructure with drift detection</span>
            </div>
            <div className="flex items-center space-x-3">
              <Cloud className="h-5 w-5 text-primary" />
              <span className="text-sm">Multi-region deployment (ap-south-1a, ap-south-1b)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}