import { lazy, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Users,
  Building2,
} from "lucide-react";
import { weekdays as weekdaysConst } from "@/constants";
import { businessService } from "@/services/api";
import type { TBusiness, TMapPoint, TBooking } from "@/types";
import { Container } from "@/components";

const BookingModal = lazy(() => import("@/components/BookingModal"));
const MapWithCoords = lazy(() => import("@/components/MapWithCoords"));

export function BusinessPage() {
  const { t } = useTranslation();
  const { bookingLink } = useParams<{ bookingLink: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<TBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!bookingLink) return;
    fetchBusiness();
  }, [bookingLink]);

  const fetchBusiness = async () => {
    if (!bookingLink) return;

    setLoading(true);
    setError(null);

    try {
      const data = await businessService.getBusinessByLink(bookingLink);
      setBusiness(data);
    } catch (err) {
      setError(
        (err as any)?.response?.data?.message ||
          t("businessPage.error.failedToLoad")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookingConfirmed = (_booking: TBooking) => {
    setShowBookingModal(false);
  };

  const handleBranchClick = (branchId: string) => {
    const branch = business?.branches.find((b) => b._id === branchId);
    if (branch) {
      setSelectedBranchId(branchId);
      setShowBookingModal(true);
    }
  };

  const getWeekdayName = (dayOfWeek: number): string => {
    const weekdayMap: Record<number, string> = {
      0: t("calendar.weekdays.mon"),
      1: t("calendar.weekdays.tue"),
      2: t("calendar.weekdays.wed"),
      3: t("calendar.weekdays.thu"),
      4: t("calendar.weekdays.fri"),
      5: t("calendar.weekdays.sat"),
      6: t("calendar.weekdays.sun"),
    };
    return weekdayMap[dayOfWeek] || "";
  };

  // Loading State Component
  const LoadingState = () => (
    <Container className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">{t("businessPage.loading")}</p>
      </div>
    </Container>
  );

  // Error State Component
  const ErrorState = () => (
    <Container className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-red-600 mb-4">
          {error || t("businessPage.error.notFound")}
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
        >
          {t("businessPage.error.goBackHome")}
        </button>
      </div>
    </Container>
  );

  // Hero Section Component
  const HeroSection = () => (
    <div className="relative h-64 md:h-80 lg:h-96 w-full">
      {business.logo?.url ? (
        <img
          src={business.logo.url}
          alt={business.businessName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <Building2 className="w-24 h-24 text-primary/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <Container>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {business.businessName}
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            {t(`businessTypes.${business.businessType}`, business.businessType)}
          </p>
          {business.rating.count > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">
                  {business.rating.average.toFixed(1)}
                </span>
                <span className="text-white/80 text-sm">
                  ({business.rating.count} {t("common.reviews")})
                </span>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );

  // Description Section Component
  const DescriptionSection = () => {
    if (!business.description) return null;
    
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-primary mb-3">
          {t("businessPage.aboutUs")}
        </h2>
        <p className="text-gray-700 leading-relaxed">{business.description}</p>
      </div>
    );
  };

  // Quick Info Cards Component
  const QuickInfoCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-5 border border-gray-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {t("businessPage.quickInfo.contact")}
          </p>
          <p className="font-semibold text-gray-900">{business.phone}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 border border-gray-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {t("businessPage.quickInfo.locations")}
          </p>
          <p className="font-semibold text-gray-900">
            {business.branches.length}{" "}
            {business.branches.length === 1
              ? t("businessPage.quickInfo.branch")
              : t("businessPage.quickInfo.branches")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 border border-gray-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {t("businessPage.quickInfo.specialists")}
          </p>
          <p className="font-semibold text-gray-900">
            {business.specialists.length} {t("businessPage.quickInfo.available")}
          </p>
        </div>
      </div>
    </div>
  );

  // Branch Card Component
  const BranchCard = ({ branch, isSelected }: { branch: any; isSelected: boolean }) => {
    const dayOfWeek = new Date().getDay() - 1;
    const todaySchedule = branch.workingHours.find(
      (wh: any) => wh.dayOfWeek === dayOfWeek
    );

    return (
      <div
        onClick={() => handleBranchClick(branch._id)}
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-gray-100 hover:border-primary/30"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-gray-900">
                {branch.address.street}
                {branch.address.state && `, ${branch.address.state}`}
              </h3>
              {branch.isBaseBranch && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {t("businessPage.branches.mainBranch")}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{branch.address.city}</p>
          </div>
        </div>

        {todaySchedule && (
          <div className="flex items-center gap-2 text-sm mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-gray-600">
              {t("businessPage.branches.today")} ({getWeekdayName(dayOfWeek)}):
            </span>
            <span
              className={
                todaySchedule.isOpen
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {todaySchedule.isOpen
                ? `${todaySchedule.openTime} - ${todaySchedule.closeTime}`
                : t("businessPage.branches.closed")}
            </span>
          </div>
        )}

        {branch.phones && branch.phones.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{branch.phones[0]}</span>
          </div>
        )}
      </div>
    );
  };

  // Branches and Map Section Component
  const BranchesAndMapSection = () => {
    const mapPoints: TMapPoint[] = business.branches
      .filter((branch) => branch.address.coordinates.latitude)
      .map((branch) => ({
        id: branch._id,
        lat: branch.address.coordinates.latitude,
        lng: branch.address.coordinates.longitude,
        isBase: branch.isBaseBranch,
        label: `${branch.address.city} - ${branch.address.street}`,
      }));

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-primary mb-4">
              {t("businessPage.branches.title")}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {business.branches.map((branch) => (
                <BranchCard
                  key={branch._id}
                  branch={branch}
                  isSelected={selectedBranchId === branch._id}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mb-4">
              {t("businessPage.map.title")}
            </h2>
            <div className="h-[500px] rounded-lg overflow-hidden border border-gray-100">
              <MapWithCoords points={mapPoints} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !business) {
    return <ErrorState />;
  }

  const selectedBranch = selectedBranchId
    ? business.branches.find((b) => b._id === selectedBranchId)
    : null;

  return (
    <>
      <div className="w-full h-full">
        <HeroSection />

        <Container className="py-8 space-y-8">
          <DescriptionSection />
          <QuickInfoCards />
          <BranchesAndMapSection />
        </Container>
      </div>

      {showBookingModal && business && (
        <BookingModal
          business={business}
          mode="create"
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBranchId(null);
          }}
          onConfirmed={handleBookingConfirmed}
          selectedBranch={selectedBranch}
        />
      )}
    </>
  );
}