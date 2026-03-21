import { useState, useEffect } from "react";
import { businessService, serviceService, uploadService } from "@/services/api";
import { Button, Input } from "@/components";
import { NumberInput, SectionTitle, Select, Card } from "@/components";
import { ServiceCard } from "./ServiceCard";
import { UploadImage } from "@/components";
import type { TBranch, TCreateService, TService } from "@/types";
import { currencies } from "@/constants/currencies";
import { formatPrice } from "@/services/format";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [services, setServices] = useState<TService[]>([]);
  const [branches, setBranches] = useState<TBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingService, setCreatingService] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<TService | null>(null);
  const [serviceImageUploading, setServiceImageUploading] = useState<Record<string, boolean>>({});
  const [mobilePanel, setMobilePanel] = useState<"list" | "form">("list");

  const [newServiceImageFile, setNewServiceImageFile] = useState<File | null>(null);
  const [newServiceImagePreview, setNewServiceImagePreview] = useState<string>("");
  const [newServiceImageUploading, setNewServiceImageUploading] = useState<boolean>(false);

  const [newService, setNewService] = useState<TCreateService>(initialService);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    serviceName: "",
    serviceDuration: "",
    servicePrice: "",
  });

  const validateServiceName = (value: string): string => {
    if (!value || !value.trim()) return t("errors.nameRequired");
    return "";
  };

  const validateServiceDuration = (value: number): string => {
    if (!value || value <= 0) return t("errors.durationInvalid");
    return "";
  };

  const validateServicePrice = (value: number): string => {
    if (value === null || value === undefined || value < 0) return t("errors.priceInvalid");
    return "";
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [servicesData, businessData] = await Promise.all([
        serviceService.getMyServices(),
        businessService.getMyBusiness(),
      ]);
      setServices(servicesData);
      setBranches(businessData.branches || []);
      const baseBranch =
        businessData.branches?.find((b: TBranch) => b.isBaseBranch)?._id ||
        businessData.branches?.[0]?._id || "";
      if (baseBranch && !newService.branch) {
        setNewService((prev) => ({ ...prev, branch: baseBranch }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceImageChange = async (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const formData = new FormData();
    formData.append("image", file);
    setServiceImageUploading((prev) => ({ ...prev, [serviceId]: true }));
    try {
      const image = await uploadService.uploadServiceImage(serviceId, formData);
      if (image) {
        setServices((prev) => prev.map((s) => (s._id === serviceId ? { ...s, image } : s)));
        if (editingService?._id === serviceId) {
          setEditingService((prev) => prev ? { ...prev, image } : prev);
        }
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
        prev.map((s) => (s._id === serviceId ? { ...s, image: { key: "", url: "" } } : s))
      );
      if (editingService?._id === serviceId) {
        setEditingService((prev) => prev ? { ...prev, image: { key: "", url: "" } } : prev);
      }
    } catch (err: any) {
      console.error("Failed to delete service image:", err);
    } finally {
      setServiceImageUploading((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleNewServiceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setNewServiceImageFile(file);
    setNewServiceImagePreview(URL.createObjectURL(file));
  };

  const handleNewServiceImageDelete = () => {
    setNewServiceImageFile(null);
    setNewServiceImagePreview("");
  };

  const resetForm = () => {
    const baseBranch = branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
    setNewService({ ...initialService, branch: baseBranch });
    setValidationErrors({ serviceName: "", serviceDuration: "", servicePrice: "" });
    setNewServiceImageFile(null);
    setNewServiceImagePreview("");
  };

  const handleAddService = async (): Promise<void> => {
    const nameError = validateServiceName(newService.name);
    const durationError = validateServiceDuration(newService.duration);
    const priceError = validateServicePrice(newService.price.amount);
    setValidationErrors({ serviceName: nameError, serviceDuration: durationError, servicePrice: priceError });
    if (nameError || durationError || priceError) return;

    setCreatingService(true);
    try {
      const createdService = await serviceService.createService(newService);
      if (newServiceImageFile) {
        setNewServiceImageUploading(true);
        try {
          const formData = new FormData();
          formData.append("image", newServiceImageFile);
          const image = await uploadService.uploadServiceImage(createdService._id, formData);
          if (image) createdService.image = image;
        } catch (err) {
          console.error("Failed to upload service image:", err);
        } finally {
          setNewServiceImageUploading(false);
        }
      }
      setServices((prev) => [...prev, createdService]);
      resetForm();
      setMobilePanel("list");
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
    setNewServiceImageFile(null);
    setNewServiceImagePreview("");
    setMobilePanel("form");
    setTimeout(() => {
      const editSection = document.getElementById("edit-service");
      if (editSection) editSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleUpdateService = async (): Promise<void> => {
    if (!editingService) return;
    const nameError = validateServiceName(newService.name);
    const durationError = validateServiceDuration(newService.duration);
    const priceError = validateServicePrice(newService.price.amount);
    setValidationErrors({ serviceName: nameError, serviceDuration: durationError, servicePrice: priceError });
    if (nameError || durationError || priceError) return;

    setCreatingService(true);
    try {
      const updatedService = await serviceService.updateService(editingService._id, newService);
      setServices((prev) => prev.map((s) => (s._id === editingService._id ? updatedService : s)));
      setEditingService(null);
      resetForm();
      setMobilePanel("list");
    } catch (error) {
      console.error("Failed to update service:", error);
    } finally {
      setCreatingService(false);
    }
  };

  const handleCancelEditService = () => {
    setEditingService(null);
    resetForm();
    setMobilePanel("list");
  };

  const handleDeleteService = async (id: string) => {
    try {
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleToggleServiceActive = async (serviceId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setServices((prev) => prev.map((s) => (s._id === serviceId ? { ...s, isActive: newStatus } : s)));
    try {
      await serviceService.updateService(serviceId, { isActive: newStatus });
    } catch (error) {
      console.error("Failed to toggle service status:", error);
      setServices((prev) => prev.map((s) => (s._id === serviceId ? { ...s, isActive: currentStatus } : s)));
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20" />
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">{t("services.loading")}</p>
        </div>
      </Card>
    );
  }

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: `${b.address.country}, ${b.address.city}, ${b.address.street}`,
  }));

  const formPanel = (
    <Card className="flex-1 overflow-auto">
      <div id="edit-service" className="flex justify-between">
        <SectionTitle
          title={editingService ? t("services.editService") : t("services.addNewService")}
          subtitle={editingService ? t("services.updateDetails") : t("services.createNewService")}
        />
        <label
          htmlFor={editingService ? `service-image-${editingService._id}` : "new-service-image"}
          className="relative h-12 w-12 rounded-full border border-dashed border-gray-300 bg-white flex justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition flex-shrink-0"
        >
          <UploadImage
            id={editingService ? `service-image-${editingService._id}` : "new-service"}
            imageUrl={editingService ? (editingService.image?.url || "") : newServiceImagePreview}
            altText={editingService ? editingService.name : t("services.newService")}
            isUploading={editingService ? (serviceImageUploading[editingService._id] || false) : newServiceImageUploading}
            onChange={editingService ? (e) => handleServiceImageChange(editingService._id, e) : handleNewServiceImageChange}
            onDelete={editingService ? () => handleDeleteServiceImage(editingService._id) : handleNewServiceImageDelete}
          />
        </label>
      </div>

      <div className="space-y-4">
        <Input
          required
          label={t("services.serviceName")}
          variant="primary"
          placeholder={t("services.serviceNamePlaceholder")}
          value={newService.name}
          onChange={(e) => {
            setNewService({ ...newService, name: e.target.value });
            setValidationErrors((prev) => ({ ...prev, serviceName: validateServiceName(e.target.value) }));
          }}
          error={validationErrors.serviceName}
        />

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4">
          <Input
            value={newService.duration}
            label={t("services.duration")}
            variant="primary"
            required
            onChange={(e) => {
              const value = e.target.value;
              const cleaned = value.replace(/[^\d.]/g, "");
              const parts = cleaned.split(".");
              const formatted = parts[0].replace(/^0+(?=\d)/, "") + (parts[1] ? "." + parts[1].slice(0, 2) : "");
              const duration = formatted ? parseFloat(formatted) : 0;
              setNewService({ ...newService, duration });
              setValidationErrors((prev) => ({ ...prev, serviceDuration: validateServiceDuration(duration) }));
            }}
            onKeyPress={(e) => {
              if (!/[\d.]/.test(e.key) && e.key !== "Backspace") e.preventDefault();
              if (e.key === "." && (e.target as HTMLInputElement).value.includes(".")) e.preventDefault();
            }}
            error={validationErrors.serviceDuration}
            placeholder="60"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              variant="primary"
              label={t("services.price")}
              inputMode="decimal"
              required
              value={newService.price.amount || "0"}
              onChange={(e) => {
                const amount = formatPrice(e.target.value);
                setNewService({ ...newService, price: { ...newService.price, amount } });
                setValidationErrors((prev) => ({ ...prev, servicePrice: validateServicePrice(amount) }));
              }}
              onKeyPress={(e) => {
                if (!/[\d.]/.test(e.key) && e.key !== "Backspace") e.preventDefault();
                if (e.key === "." && (e.target as HTMLInputElement).value.includes(".")) e.preventDefault();
              }}
              error={validationErrors.servicePrice}
              placeholder="0.00"
            />
            <Select
              label={t("services.currency")}
              variant="primary"
              options={currencies}
              value={newService.price.currency}
              onChange={(e) => setNewService({ ...newService, price: { ...newService.price, currency: e } })}
            />
          </div>
        </div>

        {branchOptions.length > 0 && (
          <Select
            variant="primary"
            required
            options={branchOptions}
            label={t("services.selectBranch")}
            className="w-full"
            value={newService.branch}
            onChange={(value) => setNewService({ ...newService, branch: value })}
          />
        )}

        <div>
          <label className="block text-sm font-medium mb-2 tracking-wide">
            {t("services.description")} <span className="text-gray-500">({t("services.optional")})</span>
          </label>
          <textarea
            placeholder={t("services.descriptionPlaceholder")}
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-base mb-2 text-gray-900">{t("services.bookingSettings")}</h4>
          <p className="text-gray-700 text-sm mb-4">{t("services.configureBooking")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">
                {t("services.timeInterval")} <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center">
                <NumberInput
                  min={5} max={240} step={5}
                  value={newService.timeInterval || 30}
                  onChange={(value: number) => setNewService({ ...newService, timeInterval: value })}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{t("services.timeIntervalHint")}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newService.allowSpecificTimes || false}
                  onChange={(e) => setNewService({ ...newService, allowSpecificTimes: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 cursor-pointer mt-0.5"
                />
                <div>
                  <span className="block text-sm font-semibold text-gray-900">
                    {t("services.allowSpecificTimes")}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">{t("services.allowSpecificTimesHint")}</p>
                </div>
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newService.isActive !== false}
                  onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })}
                  className="h-5 w-5 text-green-600 rounded border-gray-300 cursor-pointer mt-0.5"
                />
                <div>
                  <span className="block text-sm font-semibold text-gray-900">
                    {t("services.serviceActive")}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">{t("services.serviceActiveHint")}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            onClick={editingService ? handleUpdateService : handleAddService}
            disabled={creatingService}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {creatingService ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>
                  {editingService
                    ? t("services.updating")
                    : newServiceImageFile
                    ? t("services.addingWithImage")
                    : t("services.adding")}
                </span>
              </>
            ) : (
              <span>{editingService ? t("services.saveChanges") : t("services.addService")}</span>
            )}
          </Button>
          {editingService && (
            <Button variant="outline" onClick={handleCancelEditService} className="flex-1">
              {t("services.cancel")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Mobile header */}
      <div className="flex-shrink-0 flex items-center justify-between lg:hidden">
        <h1 className="text-xl font-bold text-gray-900">{t("services.title")}</h1>
        {mobilePanel === "list" ? (
          <Button variant="default" onClick={() => { setEditingService(null); resetForm(); setMobilePanel("form"); }} className="text-sm">
            {t("services.add")}
          </Button>
        ) : (
          <button
            onClick={handleCancelEditService}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("services.backToList")}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row lg:gap-5">
        {services.length > 0 && (
          <div className={`lg:flex-1 overflow-y-auto ${mobilePanel === "list" ? "flex flex-col gap-4" : "hidden"} lg:flex lg:flex-col lg:gap-4`}>
            <Card className="flex-1 max-w-full">
              <SectionTitle
                title={t("services.yourServices")}
                subtitle={t("services.manageOfferings")}
              />
              <div className="max-w-full grid gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    isEditing={editingService?._id === service._id}
                    isUploading={serviceImageUploading[service._id] || false}
                    onImageChange={(e) => handleServiceImageChange(service._id, e)}
                    onImageDelete={() => handleDeleteServiceImage(service._id)}
                    onToggleActive={() => handleToggleServiceActive(service._id, service.isActive)}
                    onEdit={() => handleEditService(service)}
                    onDelete={() => handleDeleteService(service._id)}
                  />
                ))}
              </div>
            </Card>
          </div>
        )}

        <div className={`lg:flex-1 overflow-y-auto flex flex-col ${mobilePanel === "form" || services.length === 0 ? "flex" : "hidden"} lg:flex`}>
          {formPanel}
        </div>
      </div>
    </div>
  );
};