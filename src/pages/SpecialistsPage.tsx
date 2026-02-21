import { useState, useEffect } from "react";
import { businessService, specialistService, uploadService } from "@/services/api";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@/components";
import { SectionTitle, Select, Card } from "@/components";
import type { Branch, TService, Specialist } from "@/types";

interface NewSpecialist {
  name: string;
  branch: string;
  services: string[];
  isActive: boolean;
}

interface ValidationErrors {
  specialistName: string;
  specialistBranch: string;
  specialistServices: string;
}

export const SpecialistsPage = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<TService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingSpecialist, setCreatingSpecialist] = useState<boolean>(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
  const [specialistImageUploading, setSpecialistImageUploading] = useState<
    Record<string, boolean>
  >({});

  const [newSpecialist, setNewSpecialist] = useState<NewSpecialist>({
    name: "",
    branch: "",
    services: [],
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    specialistName: "",
    specialistBranch: "",
    specialistServices: "",
  });

  // Validation functions
  const validateSpecialistName = (value: string): string => {
    if (!value || !value.trim()) {
      return "Specialist name is required";
    }
    return "";
  };

  const validateSpecialistBranch = (value: string): string => {
    if (!value || !value.trim()) {
      return "Branch is required";
    }
    return "";
  };

  const validateSpecialistServices = (value: string[]): string => {
    if (!value || value.length === 0) {
      return "At least one service must be selected";
    }
    return "";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [specialistsData, businessData] = await Promise.all([
        specialistService.getMySpecialists(),
        businessService.getMyBusiness(),
      ]);

      setSpecialists(specialistsData);
      setBranches(businessData.branches || []);
      setServices(businessData.services || []);

      // Set default branch
      const baseBranch =
        businessData.branches?.find((b: Branch) => b.isBaseBranch)?._id ||
        businessData.branches?.[0]?._id ||
        "";

      if (baseBranch && !newSpecialist.branch) {
        setNewSpecialist((prev) => ({ ...prev, branch: baseBranch }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialistImageChange = async (
    specialistId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setSpecialistImageUploading((prev) => ({ ...prev, [specialistId]: true }));
    try {
      const image = await uploadService.uploadSpecialistPhoto(specialistId, formData);

      if (image) {
        setSpecialists((prev) =>
          prev.map((s) => (s._id === specialistId ? { ...s, image } : s)),
        );
      }
    } catch (err: any) {
      console.error("Failed to upload specialist image:", err);
    } finally {
      setSpecialistImageUploading((prev) => ({ ...prev, [specialistId]: false }));
    }
  };

  const handleDeleteSpecialistImage = async (specialistId: string) => {
    setSpecialistImageUploading((prev) => ({ ...prev, [specialistId]: true }));
    try {
      await uploadService.deleteSpecialistPhoto(specialistId);
      setSpecialists((prev) =>
        prev.map((s) => (s._id === specialistId ? { ...s, image: null } : s)),
      );
    } catch (err: any) {
      console.error("Failed to delete specialist image:", err);
    } finally {
      setSpecialistImageUploading((prev) => ({ ...prev, [specialistId]: false }));
    }
  };

  const handleAddSpecialist = async (): Promise<void> => {
    const nameError = validateSpecialistName(newSpecialist.name);
    const branchError = validateSpecialistBranch(newSpecialist.branch);
    const servicesError = validateSpecialistServices(newSpecialist.services);

    setValidationErrors({
      specialistName: nameError,
      specialistBranch: branchError,
      specialistServices: servicesError,
    });

    if (nameError || branchError || servicesError) {
      return;
    }

    setCreatingSpecialist(true);
    try {
      const createdSpecialist = await specialistService.createSpecialist(newSpecialist);

      // Add new specialist to state locally
      setSpecialists((prev) => [...prev, createdSpecialist]);

      // Reset form with current base branch
      const baseBranch =
        branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
      setNewSpecialist({
        name: "",
        branch: baseBranch,
        services: [],
        isActive: true,
      });
      setValidationErrors({
        specialistName: "",
        specialistBranch: "",
        specialistServices: "",
      });
    } catch (error) {
      console.error("Failed to create specialist:", error);
    } finally {
      setCreatingSpecialist(false);
    }
  };

  const handleEditSpecialist = (specialist: Specialist) => {
    setEditingSpecialist(specialist);
    setNewSpecialist({
      name: specialist.name,
      branch: specialist.branch._id,
      services: specialist.services,
      isActive: specialist.isActive !== undefined ? specialist.isActive : true,
    });

    setTimeout(() => {
      const editSection = document.getElementById("edit-specialist");
      if (editSection) {
        editSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleUpdateSpecialist = async (): Promise<void> => {
    if (!editingSpecialist) return;

    const nameError = validateSpecialistName(newSpecialist.name);
    const branchError = validateSpecialistBranch(newSpecialist.branch);
    const servicesError = validateSpecialistServices(newSpecialist.services);

    setValidationErrors({
      specialistName: nameError,
      specialistBranch: branchError,
      specialistServices: servicesError,
    });

    if (nameError || branchError || servicesError) {
      return;
    }

    setCreatingSpecialist(true);
    try {
      const updatedSpecialist = await specialistService.updateSpecialist(
        editingSpecialist._id,
        newSpecialist,
      );

      // Update specialist in state locally
      setSpecialists((prev) =>
        prev.map((s) =>
          s._id === editingSpecialist._id ? updatedSpecialist : s,
        ),
      );

      // Reset form with current base branch
      const baseBranch =
        branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
      setNewSpecialist({
        name: "",
        branch: baseBranch,
        services: [],
        isActive: true,
      });
      setEditingSpecialist(null);
      setValidationErrors({
        specialistName: "",
        specialistBranch: "",
        specialistServices: "",
      });
    } catch (error) {
      console.error("Failed to update specialist:", error);
    } finally {
      setCreatingSpecialist(false);
    }
  };

  const handleCancelEditSpecialist = () => {
    const baseBranch =
      branches.find((b) => b.isBaseBranch)?._id || branches[0]?._id || "";
    setEditingSpecialist(null);
    setNewSpecialist({
      name: "",
      branch: baseBranch,
      services: [],
      isActive: true,
    });
    setValidationErrors({
      specialistName: "",
      specialistBranch: "",
      specialistServices: "",
    });
  };

  const handleDeleteSpecialist = async (id: string) => {
    try {
      await specialistService.deleteSpecialist(id);
      
      // Remove specialist from state locally
      setSpecialists((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Failed to delete specialist:", error);
    }
  };

  const handleToggleSpecialistActive = async (
    specialistId: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;
    
    // Optimistically update UI
    setSpecialists((prev) =>
      prev.map((s) =>
        s._id === specialistId ? { ...s, isActive: newStatus } : s,
      ),
    );

    try {
      await specialistService.updateSpecialist(specialistId, {
        isActive: newStatus,
      });
    } catch (error) {
      console.error("Failed to toggle specialist status:", error);
      
      // Revert on error
      setSpecialists((prev) =>
        prev.map((s) =>
          s._id === specialistId ? { ...s, isActive: currentStatus } : s,
        ),
      );
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setNewSpecialist((prev) => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId];
      
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        specialistServices: validateSpecialistServices(services),
      }));
      
      return { ...prev, services };
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading team members...</p>
        </div>
      </Card>
    );
  }

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: `${b.address.country}, ${b.address.city}, ${b.address.street}`,
  }));
  console.log(specialists)
  // Filter services by selected branch
  const availableServices = services.filter(
    (service) => service.branch === newSpecialist.branch && service.isActive
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Existing Specialists */}
      {specialists.length > 0 && (
        <Card>
          <SectionTitle
            title="Team Members"
            subtitle="Manage your team members and specialists"
          />
          <div className="grid gap-4">
            {specialists.map((specialist) => {
              const imageUrl =
                specialist.photo?.url || null;
              const isUploading = specialistImageUploading[specialist._id];
              return (
                <div
                  key={specialist._id}
                  className={`flex items-start justify-between p-4 rounded-xl transition-colors duration-200 ${
                    editingSpecialist?._id === specialist._id
                      ? "bg-blue-50 border-2 border-blue-300"
                      : "bg-primary/5 hover:bg-primary/10"
                  } ${!specialist.isActive ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Specialist Image */}
                    <label
                      htmlFor={`specialist-image-${specialist._id}`}
                      className="relative h-12 w-12 rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex-shrink-0"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={specialist.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xl leading-none">
                          +
                        </span>
                      )}
                      <input
                        id={`specialist-image-${specialist._id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleSpecialistImageChange(specialist._id, e)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {imageUrl && !isUploading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteSpecialistImage(specialist._id);
                          }}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          title="Remove image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </label>

                    {/* Specialist Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5
                          className={`font-semibold text-black text-lg ${!specialist.isActive ? "text-gray-500" : ""}`}
                        >
                          {specialist.name}
                        </h5>
                        {!specialist.isActive && (
                          <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
                            INACTIVE
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-sm mb-2 ${!specialist.isActive ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {specialist.services.map((service) => service.name).join(", ")}
                      </div>

                      <div
                        className={`text-xs ${!specialist.isActive ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <p>
                          Branch: {specialist.branch.address.country},{" "}
                          {specialist.branch.address.city},{" "}
                          {specialist.branch.address.street}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSpecialistActive(specialist._id, specialist.isActive)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        specialist.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      aria-label={
                        specialist.isActive
                          ? `Deactivate ${specialist.name}`
                          : `Activate ${specialist.name}`
                      }
                      title={
                        specialist.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                    >
                      {specialist.isActive ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff color="red" size={20} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditSpecialist(specialist)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label={`Edit ${specialist.name}`}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpecialist(specialist._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete ${specialist.name}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Add/Edit Specialist Form */}
      <Card>
        <div id="edit-specialist">
          <SectionTitle
            title={editingSpecialist ? "Edit Team Member" : "Add New Team Member"}
            subtitle={
              editingSpecialist
                ? "Update team member details"
                : "Create a new team member"
            }
          />
        </div>

        <div className="space-y-4">
          {/* Specialist Name */}
          <Input
            required
            label="Name"
            variant="primary"
            placeholder="e.g., John Doe"
            value={newSpecialist.name}
            onChange={(e) => {
              setNewSpecialist({ ...newSpecialist, name: e.target.value });
              setValidationErrors((prev) => ({
                ...prev,
                specialistName: validateSpecialistName(e.target.value),
              }));
            }}
            error={validationErrors.specialistName}
          />

          {/* Branch Selection */}
          {branchOptions.length > 0 && (
            <div>
              <Select
                options={branchOptions}
                label="Branch"
                className="w-full"
                value={newSpecialist.branch}
                onChange={(value) => {
                  setNewSpecialist({ ...newSpecialist, branch: value, services: [] });
                  setValidationErrors((prev) => ({
                    ...prev,
                    specialistBranch: validateSpecialistBranch(value),
                    specialistServices: "",
                  }));
                }}
              />
              {validationErrors.specialistBranch && (
                <p className="mt-1.5 text-sm text-red-600">
                  {validationErrors.specialistBranch}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                Select branch this team member will be assigned to
              </p>
            </div>
          )}

          {/* Services Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 tracking-wide">
              Services <span className="text-red-500">*</span>
            </label>
            {newSpecialist.branch && availableServices.length === 0 && (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-xl">
                No active services available for the selected branch. Please add services first.
              </div>
            )}
            {newSpecialist.branch && availableServices.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 mb-3">
                  Select services this team member will provide
                </p>
                <div className="space-y-2">
                  {availableServices.map((service) => (
                    <label
                      key={service._id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        newSpecialist.services.includes(service._id)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={newSpecialist.services.includes(service._id)}
                          onChange={() => handleServiceToggle(service._id)}
                          className="h-5 w-5 text-blue-600 rounded border-gray-300 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {service.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        ${service.price?.amount?.toFixed(2) ?? "0.00"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {validationErrors.specialistServices && (
              <p className="mt-1.5 text-sm text-red-600">
                {validationErrors.specialistServices}
              </p>
            )}
          </div>

          {/* Team Member Active */}
          <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newSpecialist.isActive !== false}
                onChange={(e) =>
                  setNewSpecialist({
                    ...newSpecialist,
                    isActive: e.target.checked,
                  })
                }
                className="h-5 w-5 text-green-600 rounded border-gray-300 cursor-pointer mt-0.5"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Team Member Active
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  When unchecked, this team member will be hidden and cannot be assigned to bookings. Useful for temporarily disabling team members without deleting them.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              onClick={editingSpecialist ? handleUpdateSpecialist : handleAddSpecialist}
              disabled={creatingSpecialist}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {creatingSpecialist ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{editingSpecialist ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingSpecialist ? "Update Team Member" : "Add Team Member"}
                  </span>
                </>
              )}
            </Button>
            {editingSpecialist && (
              <Button
                variant="outline"
                onClick={handleCancelEditSpecialist}
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