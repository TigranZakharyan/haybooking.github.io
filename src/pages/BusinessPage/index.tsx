import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Calendar,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
import { businessService } from "@/services/api";
import { MapWithCoords } from "@/components/MapWithCoords";
import { BookingModal } from "@/components/BookingModal";
import type { TBusiness, TMapPoint, TBooking } from "@/types";
import { Container } from "@/components";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BusinessPage() {
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
          "Failed to load business information",
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

  if (loading) {
    return (
      <Container className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Business not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
            Go Back Home
          </button>
        </div>
      </Container>
    );
  }

  // Convert branches to map points
  const mapPoints: TMapPoint[] = business.branches
    .filter((branch) => branch.address.coordinates.latitude)
    .map((branch) => ({
      id: branch._id,
      lat: branch.address.coordinates.latitude,
      lng: branch.address.coordinates.longitude,
      isBase: branch.isBaseBranch,
      label: `${branch.address.city} - ${branch.address.street}`,
    }));

  const selectedBranch = selectedBranchId
    ? business.branches.find((b) => b._id === selectedBranchId)
    : null;

  return (
    <>
      <div className="w-full h-full">
        {/* Hero Image Section */}
        <div className="relative h-64 md:h-80 lg:h-96 w-full bg-gradient-to-br from-primary to-secondary">
          {business.logo?.url ? (
            <img
              src={business.logo.url}
              alt={business.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-24 h-24 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Business Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <Container>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {business.businessName}
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                {business.businessType}
              </p>
              {business.rating.count > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">
                      {business.rating.average.toFixed(1)}
                    </span>
                    <span className="text-white/80 text-sm">
                      ({business.rating.count} reviews)
                    </span>
                  </div>
                </div>
              )}
            </Container>
          </div>
        </div>

        <Container className="py-8 space-y-8">
          {/* Description */}
          {business.description && (
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-primary mb-3">About Us</h2>
              <p className="text-gray-700 leading-relaxed">
                {business.description}
              </p>
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact</p>
                <p className="font-semibold text-gray-900">{business.phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Locations</p>
                <p className="font-semibold text-gray-900">
                  {business.branches.length}{" "}
                  {business.branches.length === 1 ? "Branch" : "Branches"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Specialists</p>
                <p className="font-semibold text-gray-900">
                  {business.specialists.length} Available
                </p>
              </div>
            </div>
          </div>

          {/* Branches & Map Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branches List */}
              <div>
                <h2 className="text-xl font-bold text-primary mb-4">
                  Select Branch
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {business.branches.map((branch) => {
                    const isSelected = selectedBranchId === branch._id;
                    const dayOfWeek = new Date().getDay();
                    const todaySchedule = branch.workingHours.find(
                      (wh) => wh.dayOfWeek === dayOfWeek,
                    );

                    return (
                      <div
                        key={branch._id}
                        onClick={() => handleBranchClick(branch._id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-100 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {branch.address.street}
                                {branch.address.state &&
                                  `, ${branch.address.state}`}
                              </h3>
                              {branch.isBaseBranch && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  Main Branch
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {branch.address.city}
                            </p>
                          </div>
                        </div>

                        {/* Today's Hours */}
                        {todaySchedule && (
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-gray-600">
                              {weekdays[dayOfWeek]}:
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
                                : "Closed"}
                            </span>
                          </div>
                        )}

                        {/* Contact */}
                        {branch.phones && branch.phones.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{branch.phones[0]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map */}
              <div>
                <h2 className="text-xl font-bold text-primary mb-4">
                  Our Locations
                </h2>
                <div className="h-[500px] rounded-lg overflow-hidden border border-gray-100">
                  <MapWithCoords
                    points={mapPoints}
                    selectedPoint={undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours Table */}
          {selectedBranch && (
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-primary mb-4">
                Working Hours - {selectedBranch.address.city}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Day
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBranch.workingHours.map((wh) => {
                      const dayName = weekdays[wh.dayOfWeek];
                      const isToday = wh.dayOfWeek === new Date().getDay();

                      return (
                        <tr
                          key={wh._id}
                          className={`border-b border-gray-100 last:border-b-0 ${
                            isToday ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span
                              className={`font-medium ${
                                isToday ? "text-primary" : "text-gray-700"
                              }`}
                            >
                              {dayName}
                              {isToday && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                  Today
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {wh.isOpen ? (
                              <div className="text-gray-700">
                                {wh.openTime} - {wh.closeTime}
                                {wh.hasBreak &&
                                  wh.breakStart &&
                                  wh.breakEnd && (
                                    <span className="ml-2 text-sm text-gray-500">
                                      (Break: {wh.breakStart} - {wh.breakEnd})
                                    </span>
                                  )}
                              </div>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Closed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* Booking Modal */}
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