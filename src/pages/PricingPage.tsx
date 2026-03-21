import { Button, Container } from "@/components";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const plans = [
  {
    id: "basic",
    name: "pricing.plans.basic.name",
    monthlyPrice: 29.99,
    featureKeys: [
      "pricing.plans.basic.features.0",
      "pricing.plans.basic.features.1",
      "pricing.plans.basic.features.2",
      "pricing.plans.basic.features.3",
      "pricing.plans.basic.features.4",
    ],
  },
  {
    id: "professional",
    name: "pricing.plans.professional.name",
    monthlyPrice: 49.99,
    featureKeys: [
      "pricing.plans.professional.features.0",
      "pricing.plans.professional.features.1",
      "pricing.plans.professional.features.2",
      "pricing.plans.professional.features.3",
      "pricing.plans.professional.features.4",
      "pricing.plans.professional.features.5",
    ],
  },
  {
    id: "enterprise",
    name: "pricing.plans.enterprise.name",
    monthlyPrice: 99.99,
    featureKeys: [
      "pricing.plans.enterprise.features.0",
      "pricing.plans.enterprise.features.1",
      "pricing.plans.enterprise.features.2",
      "pricing.plans.enterprise.features.3",
      "pricing.plans.enterprise.features.4",
      "pricing.plans.enterprise.features.5",
    ],
  },
];

export function PricingPage() {
  const { t } = useTranslation();
  const [currentPlanId, setCurrentPlanId] = useState("basic");

  const currentPlan = plans.find((p) => p.id === currentPlanId)!;

  return (
    <Container className="flex flex-col items-center pt-10 font-inter">
      {/* Header */}
      <div className="text-center mb-12 lg:mb-16">
        <h1 className="sm:text-5xl lg:text-6xl">{t("pricing.title")}</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 xl:gap-12">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border-2 p-8 shadow-lg transition-all duration-300 border-gray-200 bg-white hover:border-gray-300
                ${isCurrentPlan ? "ring-4 ring-green-500/50 border-green-500 shadow-xl" : "hover:shadow-md"}`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                    {t("pricing.yourPlan")}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {t(plan.name)}
                </h4>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-gray-900">
                    ${plan.monthlyPrice}
                  </span>
                  <span className="text-xl text-gray-600 font-medium">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{t("pricing.billedMonthly")}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.featureKeys.map((key) => (
                  <li key={key} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-gray-700">{t(key)}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setCurrentPlanId(plan.id)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? t("pricing.currentPlan") : t("pricing.selectPlan")}
              </Button>
            </div>
          );
        })}
      </div>
    </Container>
  );
}