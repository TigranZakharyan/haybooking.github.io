import { useState, useEffect } from "react";
import { businessService, serviceService, uploadService } from "@/services/api";
import { Button, Input } from "@/components";
import { NumberInput, SectionTitle, Select, Card } from "@/components";
import { ServiceCard } from "./ServiceCard";
import type { TBranch, TCreateService, TService } from "@/types";
import { currencies } from "@/constants/currencies";

interface ValidationErrors {
  serviceName: string;
  serviceDuration: string;
  servicePrice: string;
}

const initialService: TCreateService = {
  name: "",
  duration: 60,
  branch: "",
  price: { amount: 0, currency: currencies[0].value },
  description: "",
  timeInterval: 30,
  allowSpecificTimes: false,
  isActive: true,
};

export const ServicesPage = () => {
  const [services, setServices] = useState<TService[]>([]);
  const [branches, setBranches] = useState<TBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingService, setCreatingService] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<TService | null>(null);
  const [serviceImageUploading, setServiceImageUploading] = useState<
    Record<string, boolean>
  >({});

  const [newService, setNewService] = useState<TCreateService>(initialService);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    serviceName: "",
    serviceDuration: "",
    servicePrice: "",
  });

  // Validation functions
  const validateServiceName = (value: string): string => {
    if (!value || !value.trim()) {
      return "Service name is required";
    }
    return "";
  };

  const validateServiceDuration = (value: number): string => {
    if (!value || value <= 0) {
      return "Duration must be greater than 0";
    }
    return "";
  };

  const validateServicePrice = (value: number): string => {
    if (value === null || value === undefined || value < 0) {
      return "Price must be 0 or greater";
    }
    return "";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [servicesData, businessData] = await Promise.all([
        serviceService.getMyServices(),
        businessService.getMyBusiness(),
      ]);

      setServices(servicesData);
      setBranches(businessData.branches || []);

      // Set default branch
      const baseBranch =
        businessData.branches?.find((b: TBranch) => b.isBaseBranch)?._id ||
        businessData.branches?.[0]?._id ||
        "";

      if (baseBranch && !newService.branch) {
        setNewService((prev) => ({ ...prev, branch: baseBranch }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceImageChange = async (
    serviceId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setServiceImageUploading((prev) => ({ ...prev, [serviceId]: true }));
    try {
      const image = await uploadService.uploadServiceImage(serviceId, formData);

      if (image) {
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, image } : s)),
        );
      }
    } catch (err: any) {
      console.error("Failed to upload service image:", err);
    } finally {
      setServiceImageUploading((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleDeleteServiceImage = async (serviceId: string) => {
    setServiceImageUploading((prev) => ({ ...prev, [serviceId]: true }));
    try {
      await uploadService.deleteServiceImage(serviceId);
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, image: {key: '', url: ''} } : s)),
      );
    } catch (err: any) {
      console.error("Failed to delete service image:", err);
    } finally {
      setServiceImageUploading((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleAddService = async (): Promise<void> => {
    const nameError = validateServiceName(newService.name);
    const durationError = validateServiceDuration(newService.duration);
    const priceError = validateServicePrice(newService.price.amount);

    setValidationErrors({
      serviceName: nameError,
      serviceDuration: durationError,
      servicePrice: priceError,
    });

    if (nameError || durationError || priceError) {
      return;
    }

    setCreatingService(true);
    try {
      const createdService = await serviceService.createService(newService);

      // Add new service to state locally
      setServices((prev) => [...prev, createdService]);

      // Reset form with current base branch
      const baseBranch =
        branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
      setNewService({
        ...initialService,
        branch: baseBranch,
      });
      setValidationErrors({
        serviceName: "",
        serviceDuration: "",
        servicePrice: "",
      });
    } catch (error) {
      console.error("Failed to create service:", error);
    } finally {
      setCreatingService(false);
    }
  };

  const handleEditService = (service: TService) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      duration: service.duration,
      price: service.price,
      branch: service.branch._id,
      description: service.description || "",
      timeInterval: service.timeInterval || 30,
      allowSpecificTimes: service.allowSpecificTimes || false,
      isActive: service.isActive !== undefined ? service.isActive : true,
    });

    setTimeout(() => {
      const editSection = document.getElementById("edit-service");
      if (editSection) {
        editSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleUpdateService = async (): Promise<void> => {
    if (!editingService) return;

    const nameError = validateServiceName(newService.name);
    const durationError = validateServiceDuration(newService.duration);
    const priceError = validateServicePrice(newService.price.amount);

    setValidationErrors({
      serviceName: nameError,
      serviceDuration: durationError,
      servicePrice: priceError,
    });

    if (nameError || durationError || priceError) {
      return;
    }

    setCreatingService(true);
    try {
      const updatedService = await serviceService.updateService(
        editingService._id,
        newService,
      );

      // Update service in state locally
      setServices((prev) =>
        prev.map((s) => (s._id === editingService._id ? updatedService : s)),
      );

      // Reset form with current base branch
      const baseBranch =
        branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
      setNewService({
        ...initialService,
        branch: baseBranch,
      });
      setEditingService(null);
      setValidationErrors({
        serviceName: "",
        serviceDuration: "",
        servicePrice: "",
      });
    } catch (error) {
      console.error("Failed to update service:", error);
    } finally {
      setCreatingService(false);
    }
  };

  const handleCancelEditService = () => {
    const baseBranch =
      branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
    setEditingService(null);
    setNewService({
      ...initialService,
      branch: baseBranch,
    });
    setValidationErrors({
      serviceName: "",
      serviceDuration: "",
      servicePrice: "",
    });
  };

  const handleDeleteService = async (id: string) => {
    try {
      await serviceService.deleteService(id);

      // Remove service from state locally
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleToggleServiceActive = async (
    serviceId: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;

    // Optimistically update UI
    setServices((prev) =>
      prev.map((s) =>
        s._id === serviceId ? { ...s, isActive: newStatus } : s,
      ),
    );

    try {
      await serviceService.updateService(serviceId, {
        isActive: newStatus,
      });
    } catch (error) {
      console.error("Failed to toggle service status:", error);

      // Revert on error
      setServices((prev) =>
        prev.map((s) =>
          s._id === serviceId ? { ...s, isActive: currentStatus } : s,
        ),
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading services...</p>
        </div>
      </Card>
    );
  }

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: `${b.address.country}, ${b.address.city}, ${b.address.street}`,
  }));

  return (
    <div className="flex h-full gap-5">
      {/* Existing Services */}
      {services.length > 0 && (
        <Card className="flex-1">
          <SectionTitle
            title="Your Services"
            subtitle="Manage your service offerings and pricing"
          />
          <div className="grid gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                isEditing={editingService?._id === service._id}
                isUploading={serviceImageUploading[service._id] || false}
                onImageChange={(e) => handleServiceImageChange(service._id, e)}
                onImageDelete={() => handleDeleteServiceImage(service._id)}
                onToggleActive={() =>
                  handleToggleServiceActive(service._id, service.isActive)
                }
                onEdit={() => handleEditService(service)}
                onDelete={() => handleDeleteService(service._id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Add/Edit Service Form */}
      <Card className="flex-1 overflow-auto">
        <div id="edit-service">
          <SectionTitle
            title={editingService ? "Edit Service" : "Add New Service"}
            subtitle={
              editingService
                ? "Update service details"
                : "Create a new service offering"
            }
          />
        </div>

        <div className="space-y-4">
          {/* Service Name */}
          <Input
            required
            label="Service Name"
            variant="primary"
            placeholder="e.g., Haircut, Massage, Consultation"
            value={newService.name}
            onChange={(e) => {
              setNewService({ ...newService, name: e.target.value });
              setValidationErrors((prev) => ({
                ...prev,
                serviceName: validateServiceName(e.target.value),
              }));
            }}
            error={validationErrors.serviceName}
          />

          {/* Duration and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                value={newService.duration}
                label="Duration (minutes)"
                variant="primary"
                required
                onChange={(e) => {
                  const value = e.target.value;
                  const cleaned = value.replace(/[^\d.]/g, "");
                  const parts = cleaned.split(".");
                  const formatted =
                    parts[0].replace(/^0+(?=\d)/, "") +
                    (parts[1] ? "." + parts[1].slice(0, 2) : "");
                  const duration = formatted ? parseFloat(formatted) : 0;
                  setNewService({ ...newService, duration });
                  setValidationErrors((prev) => ({
                    ...prev,
                    serviceDuration: validateServiceDuration(duration),
                  }));
                }}
                onKeyPress={(e) => {
                  if (!/[\d.]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault();
                  }
                  if (
                    e.key === "." &&
                    (e.target as HTMLInputElement).value.includes(".")
                  ) {
                    e.preventDefault();
                  }
                }}
                error={validationErrors.serviceDuration}
                placeholder="60"
              />
            </div>

            <div className="flex gap-6">
              <Input
                variant="primary"
                label="Price"
                inputMode="decimal"
                required
                value={newService.price.amount || "0"}
                onChange={(e) => {
                  const value = e.target.value;
                  const cleaned = value.replace(/[^\d.]/g, "");
                  const parts = cleaned.split(".");
                  const formatted =
                    parts[0].replace(/^0+(?=\d)/, "") +
                    (parts[1] ? "." + parts[1].slice(0, 2) : "");
                  const amount = formatted ? parseFloat(formatted) : 0;
                  setNewService({
                    ...newService,
                    price: { ...newService.price, amount: Number(value) },
                  });
                  setValidationErrors((prev) => ({
                    ...prev,
                    servicePrice: validateServicePrice(amount),
                  }));
                }}
                onKeyPress={(e) => {
                  if (!/[\d.]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault();
                  }
                  if (
                    e.key === "." &&
                    (e.target as HTMLInputElement).value.includes(".")
                  ) {
                    e.preventDefault();
                  }
                }}
                error={validationErrors.servicePrice}
                placeholder="0.00"
              />
              <Select
                label="Currency"
                variant="primary"
                options={currencies}
                value={newService.price.currency}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    price: { ...newService.price, currency: e },
                  })
                }
              />
            </div>
          </div>

          {/* Branch Selection */}
          {branchOptions.length > 0 && (
            <div>
              <Select
                variant="primary"
                required
                options={branchOptions}
                label="Select Branch"
                className="w-full"
                value={newService.branch}
                onChange={(value) =>
                  setNewService({ ...newService, branch: value })
                }
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 tracking-wide">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              placeholder="Describe what this service includes..."
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Booking Settings */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-base mb-4 text-gray-900">
              Booking Settings
            </h4>
            <p className="text-gray-700 text-sm mb-4">
              Configure how customers can book this service
            </p>

            <div className="space-y-4">
              {/* Time Interval */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Time Interval (minutes){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center">
                  <NumberInput
                    min={5}
                    max={240}
                    step={5}
                    value={newService.timeInterval || 30}
                    onChange={(value: number) =>
                      setNewService({ ...newService, timeInterval: value })
                    }
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This determines the time slots available for booking. Enter
                  any multiple of 5 minutes. For example, if set to 30 minutes,
                  customers can book at 9:00, 9:30, 10:00, etc.
                </p>
              </div>

              {/* Allow Specific Times */}
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newService.allowSpecificTimes || false}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        allowSpecificTimes: e.target.checked,
                      })
                    }
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">
                      Allow Specific Times
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      When enabled, customers can only book at exact times you
                      specify. When disabled, they can book at any available
                      time slot based on your time interval.
                    </p>
                  </div>
                </label>
              </div>

              {/* Service Active */}
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newService.isActive !== false}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-5 w-5 text-green-600 rounded border-gray-300 cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">
                      Service Active
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      When unchecked, this service will be hidden from customers
                      and cannot be booked.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              onClick={editingService ? handleUpdateService : handleAddService}
              disabled={creatingService}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {creatingService ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{editingService ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {editingService ? "Update Service" : "Add Service"}
                  </span>
                </>
              )}
            </Button>
            {editingService && (
              <Button
                variant="outline"
                onClick={handleCancelEditService}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
