import { Button, Container } from "@/components";
import { Check } from "lucide-react";
import { useState } from "react";

export function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState({
    id: "basic",
    name: "Basic Plan",
    price: 29.99,
    billingCycle: "monthly",
    nextBilling: "2024-11-01",
    features: [
      "Up to 100 bookings/month",
      "Email support",
      "Mobile app access",
      "Basic analytics",
      "2 team members",
    ],
  });

  // Pricing data including only monthly rates
  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 29.99,
      // yearlyPrice: 299.99, // Removed annual price
      features: [
        "Up to 100 bookings/month",
        "Basic analytics",
        "Email support",
        "2 team members included",
        "Mobile app access",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      monthlyPrice: 49.99,
      // yearlyPrice: 499.99, // Removed annual price
      popular: true, // Retain for internal data consistency but removed from styling
      features: [
        "Unlimited bookings",
        "Advanced analytics & reporting",
        "Priority 24/7 support",
        "Custom branding & domain",
        "Up to 10 team members",
        "API access & integrations",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: 99.99,
      // yearlyPrice: 999.99, // Removed annual price
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Dedicated account manager",
        "Custom development/SLA",
        "White-label solution",
        "Advanced security features",
      ],
    },
  ];

  const handleChangePlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const price = plan.monthlyPrice;
      const cycleText = "monthly";

      setCurrentPlan({
        id: plan.id,
        name: `${plan.name} Plan`,
        price: price,
        billingCycle: cycleText,
        nextBilling: "2025-11-01", // Example date
        features: plan.features,
      });
    }
  };

  // Removed getPrice and getCycleLabel as they are no longer needed for fixed monthly billing

  // Removed isAnnual as it is no longer needed

  return (
    <Container className="flex flex-col items-center pt-10 font-inter">
      {/* 1. Header Section */}
      <div className="text-center mb-12 lg:mb-16">
        <h1 className="sm:text-5xl lg:text-6xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          All plans are billed monthly. Choose the features that best fit your
          business.
        </p>
      </div>

      {/* 2. Billing Cycle Toggle - REMOVED */}

      {/* 3. Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 xl:gap-12">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan.id;
          const price = plan.monthlyPrice; // Direct use of monthly price

          return (
            <div
              key={plan.id}
              // Uniform styling: all cards are visually the same unless they are the current plan
              className={`relative flex flex-col rounded-3xl border-2 p-8 shadow-lg transition-all duration-300 border-gray-200 bg-white hover:border-gray-300
                                    ${isCurrentPlan ? "ring-4 ring-green-500/50 border-green-500 shadow-xl" : "hover:shadow-md"}`}
            >
              {/* Tag for Popular/Current Plan - Popular tag removed for uniformity */}
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                    Your Plan
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h4>
                <div className="mb-4">
                  {/* Display only monthly price */}
                  <span className="text-5xl font-extrabold text-gray-900">
                    ${price}
                  </span>
                  <span className="text-xl text-gray-600 font-medium">/mo</span>
                </div>
                <p className="text-sm text-gray-500">Billed Monthly</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <Button
                onClick={() => handleChangePlan(plan.id)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? `Current Plan` : "Select Plan"}
              </Button>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
