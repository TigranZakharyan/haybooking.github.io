import { useState, useEffect, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Button, Container, Input, Select, Pagination } from "@/components";
import { businessService, searchService } from "@/services/api";
import type {
  TBusiness,
  TBusinessType,
  TPagination,
  TSearchBusinessParams,
} from "@/types";
import { ServiceCard } from "./ServiceCard";

const BookingModal = lazy(() => import("@/components/BookingModal"));

const TOP_FILTERS = [
  {
    value: "health",
    translationKey: "homePage.categories.health",
    icon: "/healthcare.png",
  },
  {
    value: "beauty",
    translationKey: "homePage.categories.beauty",
    icon: "/products.png",
  },
  {
    value: "home",
    translationKey: "homePage.categories.home",
    icon: "/house.png",
  },
  {
    value: "tourism",
    translationKey: "homePage.categories.tourism",
    icon: "/tour-guide.png",
  },
  {
    value: "car",
    translationKey: "homePage.categories.car",
    icon: "/car.png",
  },
  {
    value: "photography",
    translationKey: "homePage.categories.photography",
    icon: "/photo.png",
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<TBusiness[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<TBusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<TPagination>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<TSearchBusinessParams>({
    q: "",
    city: "",
    type: "all",
  });
  const [selectedBusiness, setSelectedBusiness] = useState<TBusiness | null>(
    null,
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [citiesData, typesData, businessesData] = await Promise.all([
        searchService.getCities(),
        searchService.getBusinessTypes(),
        searchService.searchBusinesses({}),
      ]);
      setCities(citiesData);
      setTypes(typesData);
      setBusinesses(businessesData.businesses);
      setPagination(businessesData.pagination);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
    try {
      const result = await searchService.searchBusinesses({ ...filters, page });
      setBusinesses(result.businesses);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingClick = async (business: TBusiness) => {
    const fetchBusinessDetails = await businessService.getBusinessByLink(
      business.bookingLink,
    );
    setSelectedBusiness(fetchBusinessDetails);
  };

  const handleCategoryClick = (value: string) => {
    const next = activeCategory === value ? null : value;
    setActiveCategory(next);
    setFilters((prev) => ({ ...prev, type: next ?? "all" }));
    handleSearch();
  };

  const handleCloseModal = () => setSelectedBusiness(null);
  const handleConfirmed = () => setSelectedBusiness(null);

  if (loading && businesses.length === 0) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container>
      <div className="w-full h-full absolute -z-10 bg-[url(/home-bg.jpg)] opacity-[.60] top-0 left-0" />
        {/* ── Category icon filters ── */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-6">
          {TOP_FILTERS.map(({ label, value, translationKey, icon }) => {
            const isActive = activeCategory === value;
            return (
              <button
                key={value}
                onClick={() => handleCategoryClick(value)}
                className="flex flex-col items-center gap-1.5 group focus:outline-none transition-all duration-200"
              >
                <span
                  className={[
                    "flex items-center justify-center p-2 w-16 h-16 rounded-2xl text-3xl",
                    "transition-all duration-200",
                    isActive
                      ? "bg-primary/30 text-white shadow-primary/30 shadow-md"
                      : "",
                  ].join(" ")}
                >
                  <img src={icon} alt={t(translationKey)} className="w-10 h-10 object-contain" />
                </span>

                <span
                  className={[
                    "text-secondary font-medium tracking-wide transition-colors duration-200",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-gray-500 group-hover:text-primary",
                  ].join(" ")}
                >
                  {t(translationKey)}
                </span>
              </button>
            );
          })}
        </div>

        <h2 className="uppercase text-xl sm:text-2xl md:text-3xl text-center">
          {t("homePage.findAndBook")}
        </h2>

        {/* ── Mobile filter toggle ── */}
        <div className="mt-4 mb-2 sm:hidden">
          <Button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="w-full bg-primary/10 text-primary font-semibold border border-primary/30"
          >
            {filtersOpen
              ? t("homePage.hideFilters")
              : t("homePage.showFilters")}
          </Button>
        </div>

        {/* ── Filters panel with horizontal padding ── */}
        <div className="px-4 sm:px-6 md:px-8">
          <div
            className={[
              "overflow-hidden transition-all duration-300",
              filtersOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
              "sm:max-h-none sm:opacity-100",
            ].join(" ")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4 sm:my-8">
              <Input
                variant="primary"
                placeholder={t("homePage.searchPlaceholder")}
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />

              <Select
                variant="primary"
                options={cities.map((city) => ({ value: city, label: city }))}
                placeholder={t("homePage.allCities")}
                value={filters.city}
                onChange={(value) =>
                  setFilters({ ...filters, city: value as string })
                }
              />

              <Select
                variant="primary"
                options={[
                  { value: "all", label: t("homePage.allTypes") },
                  ...types.map(type => ({ ...type, label: t(`businessTypes.${type.value}`, type.label) })),
                ]}
                placeholder={t("homePage.allTypes")}
                value={filters.type}
                onChange={(value) => {
                  setFilters({ ...filters, type: value as string });
                  setActiveCategory(null);
                }}
              />

              <Button
                onClick={() => handleSearch(1)}
                className="bg-primary text-white font-bold hover:bg-primary/95 shadow-xl w-full"
              >
                {loading ? t("homePage.searching") : t("homePage.search")}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Results grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 justify-items-center sm:justify-items-stretch">
          {businesses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-xl font-semibold text-gray-700">
                {t("homePage.noBusinesses")}
              </p>
              <p className="text-gray-500 mt-2">
                {t("homePage.adjustFilters")}
              </p>
            </div>
          ) : (
            businesses.map((business) => {
              const prices = business.services
                ?.map((s) => s.price)
                ?.filter((p) => p && typeof p.amount === "number");

              const lowestPrice = prices?.length
                ? prices.reduce(
                    (min, p) => (p.amount < min.amount ? p : min),
                    prices[0],
                  )
                : null;

              return (
                <div key={business.id} className="w-full max-w-xs">
                  <ServiceCard
                    title={business.businessName}
                    logo={business.logo}
                    specialists={business.specialists?.length || 0}
                    services={business.services?.length || 0}
                    priceFrom={lowestPrice?.amount || 0}
                    currency={lowestPrice?.currency || ""}
                    buttonText={t("dashboard.bookNow")}
                    onButtonClick={() => handleBookingClick(business)}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination && (
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        )}
      </Container>

      {/* ── Booking Modal ── */}
      {selectedBusiness && (
        <BookingModal
          business={selectedBusiness}
          onClose={handleCloseModal}
          onConfirmed={handleConfirmed}
        />
      )}
    </>
  );
}