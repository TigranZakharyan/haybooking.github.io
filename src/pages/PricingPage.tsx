import { Button, Container } from "@/components";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const plans = [
  {
    id: "free",
    name: "pricing.plans.free.name",
    price: 0,
    priceLabel: "pricing.plans.free.priceLabel",
    badge: null,
    badgeColor: null,
    featureKeys: [
      "pricing.plans.free.features.0",
      "pricing.plans.free.features.1",
      "pricing.plans.free.features.2",
      "pricing.plans.free.features.3",
      "pricing.plans.free.features.4",
      "pricing.plans.free.features.5",
      "pricing.plans.free.features.6",
    ],
    featureDescKeys: [
      "pricing.plans.free.descs.0",
      "pricing.plans.free.descs.1",
      "pricing.plans.free.descs.2",
      "pricing.plans.free.descs.3",
      "pricing.plans.free.descs.4",
      "pricing.plans.free.descs.5",
      "pricing.plans.free.descs.6",
    ],
    priceColor: "text-green-600",
    buttonVariant: "outline" as const,
  },
  {
    id: "monthly",
    name: "pricing.plans.monthly.name",
    price: 20,
    priceLabel: "pricing.plans.monthly.priceLabel",
    badge: null,
    badgeColor: null,
    featureKeys: [
      "pricing.plans.monthly.features.0",
      "pricing.plans.monthly.features.1",
      "pricing.plans.monthly.features.2",
      "pricing.plans.monthly.features.3",
      "pricing.plans.monthly.features.4",
      "pricing.plans.monthly.features.5",
      "pricing.plans.monthly.features.6",
    ],
    featureDescKeys: [
      "pricing.plans.monthly.descs.0",
      "pricing.plans.monthly.descs.1",
      "pricing.plans.monthly.descs.2",
      "pricing.plans.monthly.descs.3",
      "pricing.plans.monthly.descs.4",
      "pricing.plans.monthly.descs.5",
      "pricing.plans.monthly.descs.6",
    ],
    priceColor: "text-amber-500",
    buttonVariant: "outline" as const,
  },
  {
    id: "halfyear",
    name: "pricing.plans.halfyear.name",
    price: 100,
    priceLabel: "pricing.plans.halfyear.priceLabel",
    badge: "pricing.mostPopular",
    badgeColor: "bg-indigo-600",
    savingsKey: "pricing.plans.halfyear.savings",
    featureKeys: [
      "pricing.plans.halfyear.features.0",
      "pricing.plans.halfyear.features.1",
      "pricing.plans.halfyear.features.2",
      "pricing.plans.halfyear.features.3",
      "pricing.plans.halfyear.features.4",
      "pricing.plans.halfyear.features.5",
      "pricing.plans.halfyear.features.6",
    ],
    featureDescKeys: [
      "pricing.plans.halfyear.descs.0",
      "pricing.plans.halfyear.descs.1",
      "pricing.plans.halfyear.descs.2",
      "pricing.plans.halfyear.descs.3",
      "pricing.plans.halfyear.descs.4",
      "pricing.plans.halfyear.descs.5",
      "pricing.plans.halfyear.descs.6",
    ],
    priceColor: "text-indigo-600",
    buttonVariant: "primary" as const,
  },
  {
    id: "yearly",
    name: "pricing.plans.yearly.name",
    price: 180,
    priceLabel: "pricing.plans.yearly.priceLabel",
    badge: "pricing.bestValue",
    badgeColor: "bg-orange-500",
    savingsKey: "pricing.plans.yearly.savings",
    featureKeys: [
      "pricing.plans.yearly.features.0",
      "pricing.plans.yearly.features.1",
      "pricing.plans.yearly.features.2",
      "pricing.plans.yearly.features.3",
      "pricing.plans.yearly.features.4",
      "pricing.plans.yearly.features.5",
      "pricing.plans.yearly.features.6",
    ],
    featureDescKeys: [
      "pricing.plans.yearly.descs.0",
      "pricing.plans.yearly.descs.1",
      "pricing.plans.yearly.descs.2",
      "pricing.plans.yearly.descs.3",
      "pricing.plans.yearly.descs.4",
      "pricing.plans.yearly.descs.5",
      "pricing.plans.yearly.descs.6",
    ],
    priceColor: "text-orange-500",
    buttonVariant: "outline" as const,
  },
];

export function PricingPage() {
  const { t } = useTranslation();
  const [currentPlanId, setCurrentPlanId] = useState("free");

  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center py-10 px-8 font-inter">
      {/* Header */}
      <div className="text-center mb-12 lg:mb-16">
        <h1 className="sm:text-5xl lg:text-6xl">{t("pricing.title")}</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border-2 p-6 shadow-lg transition-all duration-300 bg-white
                ${isCurrentPlan
                  ? "ring-4 ring-green-500/50 border-green-500 shadow-xl"
                  : plan.id === "halfyear"
                  ? "border-indigo-400 shadow-xl"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-3 py-1 ${plan.badgeColor} text-white text-xs font-semibold rounded-full shadow-md whitespace-nowrap`}>
                    {t(plan.badge)}
                  </span>
                </div>
              )}

              {isCurrentPlan && !plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                    {t("pricing.yourPlan")}
                  </span>
                </div>
              )}

              {/* Plan Name & Price */}
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  {t(plan.name)}
                </h4>
                <div className="mb-1">
                  <span className={`text-5xl font-extrabold ${plan.priceColor}`}>
                    ${plan.price}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{t(plan.priceLabel)}</p>
                {"savingsKey" in plan && (
                  <span className="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {t((plan as any).savingsKey)}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-5" />

              {/* Features label */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t("pricing.whatsIncluded")}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.featureKeys.map((key, i) => (
                  <li key={key} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t(key)}</p>
                      <p className="text-xs text-gray-500">{t(plan.featureDescKeys[i])}</p>
                    </div>
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
    </div>
  );
}