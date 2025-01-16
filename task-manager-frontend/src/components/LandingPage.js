import React from 'react';
import { ChevronRight, Users, Shield, Clock } from 'lucide-react';

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white text-blue-600 hover:bg-gray-100"
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const LandingPage = ({ onSignIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
              Streamline Your Team's Tasks
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Manage projects efficiently, track deadlines, and boost productivity with our intuitive task management system.
            </p>
            <Button onClick={onSignIn} className="gap-2">
              Get Started Now
              <ChevronRight size={20} />
            </Button>
          </div>
          <div className="relative">
            <img 
              src="/api/placeholder/600/400" 
              alt="Task Management Dashboard" 
              className="rounded-lg shadow-xl w-full"
            />
            <div className="absolute -bottom-4 -right-4">
              <img 
                src="/api/placeholder/80/80" 
                alt="User Avatar" 
                className="rounded-full border-4 border-white shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Why Choose Our Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Users size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Work seamlessly with your team members. Assign tasks, share updates, and track progress in real-time.
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Clock size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Deadline Management
              </h3>
              <p className="text-gray-600">
                Never miss a deadline again. Get smart notifications and stay on top of your project timelines.
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Shield size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security. Access your tasks anywhere, anytime.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to Transform Your Task Management?
          </h2>
          <p className="text-xl mb-8 text-white opacity-90">
            Join thousands of teams already using our platform
          </p>
          <Button 
            onClick={onSignIn}
            variant="secondary"
          >
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
