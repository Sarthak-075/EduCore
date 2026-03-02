import { GraduationCap } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { MobileContainer } from "../components/MobileContainer";
import { Link } from "react-router";

export function OnboardingScreen() {
  return (
    <MobileContainer className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Illustration */}
        <div className="w-48 h-48 mb-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-xl">
          <GraduationCap className="w-24 h-24 text-white" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Collect Fees With Ease
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm">
            Track payments and manage dues effortlessly.
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full space-y-4">
          <Link to="/signup" className="block">
            <GradientButton size="lg" className="w-full">
              Get Started
            </GradientButton>
          </Link>
          <Link to="/login" className="block">
            <GradientButton variant="secondary" size="lg" className="w-full">
              Login
            </GradientButton>
          </Link>
        </div>
      </div>
    </MobileContainer>
  );
}
