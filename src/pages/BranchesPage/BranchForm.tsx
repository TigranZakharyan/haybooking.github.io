import { MapPin, Phone, Clock, X, Trash2, Plus } from "lucide-react";
import { Card, Button, Input, SectionTitle, Select } from "@/components";
import { SwitchTabs } from "@/components/SwitchTabs";
import type { Branch, NewBranch, WorkingHoursUI } from "@/types";
import { cities, countries, weekdays } from "@/constants";
import { useState } from "react";

interface BranchFormProps {
  form: NewBranch;
  setForm: (form: NewBranch) => void;
  editingBranch: Branch | null;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const BranchForm = ({
  form,
  setForm,
  editingBranch,
  saving,
  onSave,
  onCancel,
}: BranchFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("location");
  const [errors, setErrors] = useState<{
    street?: string;
    country?: string;
    city?: string;
    phones?: string[];
    workingHours?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let firstErrorTab: string | null = null;

    // Validate Location tab
    if (!form.address.street.trim()) {
      newErrors.street = "Street address is required";
      if (!firstErrorTab) firstErrorTab = "location";
    }
    if (!form.address.country) {
      newErrors.country = "Country is required";
      if (!firstErrorTab) firstErrorTab = "location";
    }
    if (!form.address.city) {
      newErrors.city = "City is required";
      if (!firstErrorTab) firstErrorTab = "location";
    }

    // Validate Phones tab
    const phoneErrors: string[] = [];
    let hasValidPhone = false;
    form.phones.forEach((phone, index) => {
      if (!phone.trim()) {
        phoneErrors[index] = "Phone number is required";
      } else {
        hasValidPhone = true;
        phoneErrors[index] = "";
      }
    });

    if (!hasValidPhone) {
      newErrors.phones = phoneErrors;
      if (!firstErrorTab) firstErrorTab = "phones";
    } else if (phoneErrors.some(err => err)) {
      newErrors.phones = phoneErrors;
      if (!firstErrorTab) firstErrorTab = "phones";
    }

    // Validate Working Hours tab
    if (form.workingHours && form.workingHours.length > 0) {
      const hasOpenDay = form.workingHours.some(wh => wh.isOpen);
      const invalidHours = form.workingHours.some(wh => {
        if (!wh.isOpen) return false;
        return !wh.openTime || !wh.closeTime;
      });

      if (!hasOpenDay) {
        newErrors.workingHours = "At least one day must be open";
        if (!firstErrorTab) firstErrorTab = "hours";
      } else if (invalidHours) {
        newErrors.workingHours = "Please set opening and closing times for all open days";
        if (!firstErrorTab) firstErrorTab = "hours";
      }
    }

    setErrors(newErrors);

    // Navigate to first tab with error
    if (firstErrorTab) {
      setActiveTab(firstErrorTab);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const addPhone = () => {
    setForm({ ...form, phones: [...form.phones, ""] });
    // Clear phone errors when adding new phone
    if (errors.phones) {
      setErrors({ ...errors, phones: undefined });
    }
  };

  const updatePhone = (index: number, value: string) => {
    const updated = [...form.phones];
    updated[index] = value;
    setForm({ ...form, phones: updated });
    
    // Clear error for this phone when user types
    if (errors.phones?.[index]) {
      const updatedErrors = [...(errors.phones || [])];
      updatedErrors[index] = "";
      setErrors({ ...errors, phones: updatedErrors });
    }
  };

  const removePhone = (index: number) => {
    if (form.phones.length === 1) return;
    setForm({
      ...form,
      phones: form.phones.filter((_, i) => i !== index),
    });
  };

  const updateWorkingHours = (
    index: number,
    field: keyof WorkingHoursUI,
    value: any,
  ) => {
    const updated = [...form.workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, workingHours: updated });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        {/* Header */}
        <div className="flex justify-center border-b mb-2 border-gray-200 relative">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingBranch ? "Edit Branch" : "Add New Branch"}
            </h2>
              <SwitchTabs
                tabs={["location", "phones", "hours"]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
          </div>

          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors absolute right-0 top-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="min-h-[400px] px-1">
          {/* Location Details Tab */}
          {activeTab === "location" && (
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Location Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Enter the branch address information
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Street Address"
                  placeholder="e.g., 123 Main Street, Suite 100"
                  value={form.address.street}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      address: { ...form.address, street: e.target.value },
                    });
                    // Clear error when user types
                    if (errors.street) {
                      setErrors({ ...errors, street: undefined });
                    }
                  }}
                  error={errors.street}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    options={countries}
                    label="Country"
                    placeholder="Select Country"
                    value={form.address.country}
                    onChange={(value) => {
                      setForm({
                        ...form,
                        address: { ...form.address, country: value },
                      });
                      // Clear error when user selects
                      if (errors.country) {
                        setErrors({ ...errors, country: undefined });
                      }
                    }}
                    error={errors.country}
                    required
                  />
                  <Select
                    options={cities[form.address.country] || []}
                    label="City"
                    placeholder="Select City"
                    value={form.address.city}
                    onChange={(value) => {
                      setForm({
                        ...form,
                        address: { ...form.address, city: value },
                      });
                      // Clear error when user selects
                      if (errors.city) {
                        setErrors({ ...errors, city: undefined });
                      }
                    }}
                    error={errors.city}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="State/Province"
                    placeholder="Optional"
                    value={form.address.state}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, state: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Zip/Postal Code"
                    placeholder="e.g., 0010"
                    value={form.address.zipCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, zipCode: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Base Branch Section */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300 transition-colors">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isBaseBranch}
                      onChange={(e) =>
                        setForm({ ...form, isBaseBranch: e.target.checked })
                      }
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 cursor-pointer mt-0.5 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="block text-base font-semibold text-gray-900 mb-1">
                        Set as Base Branch
                      </span>
                      <p className="text-sm text-gray-600">
                        Mark this as your primary or headquarters location. This
                        helps identify your main branch in the system.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Phone Numbers Tab */}
          {activeTab === "phones" && (
            <section className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Contact Numbers <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Add one or more phone numbers
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={addPhone}
                  className="text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Phone
                </Button>
              </div>

              <div className="space-y-3">
                {form.phones.map((phone, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., +374980905444"
                        value={phone}
                        onChange={(e) => updatePhone(i, e.target.value)}
                        label={i === 0 ? "Primary" : `Phone ${i + 1}`}
                        error={errors.phones?.[i]}
                      />
                    </div>
                    {form.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhone(i)}
                        className="mt-7 p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove phone"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {form.phones.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3">
                    <Phone className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    No phone numbers added
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Add at least one contact number for this branch
                  </p>
                  <Button
                    variant="outline"
                    onClick={addPhone}
                    className="text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add First Phone
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Working Hours Tab */}
          {activeTab === "hours" && (
            <section className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Business Hours <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Set operating hours for each day
                    </p>
                  </div>
                </div>
              </div>

              {errors.workingHours && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{errors.workingHours}</p>
                </div>
              )}

              {form.workingHours && form.workingHours.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {form.workingHours.map((wh, i) => (
                    <div
                      key={i}
                      className={`border rounded-xl p-4 transition-all ${
                        wh.isOpen
                          ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-900">
                          {weekdays[wh.dayOfWeek]}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={wh.isOpen}
                            onChange={(e) => {
                              updateWorkingHours(i, "isOpen", e.target.checked);
                              // Clear working hours error when user makes changes
                              if (errors.workingHours) {
                                setErrors({ ...errors, workingHours: undefined });
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {wh.isOpen ? "Open" : "Closed"}
                          </span>
                        </label>
                      </div>

                      {wh.isOpen ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Opens at
                              </label>
                              <input
                                type="time"
                                value={wh.openTime}
                                onChange={(e) => {
                                  updateWorkingHours(
                                    i,
                                    "openTime",
                                    e.target.value,
                                  );
                                  // Clear working hours error when user makes changes
                                  if (errors.workingHours) {
                                    setErrors({ ...errors, workingHours: undefined });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Closes at
                              </label>
                              <input
                                type="time"
                                value={wh.closeTime}
                                onChange={(e) => {
                                  updateWorkingHours(
                                    i,
                                    "closeTime",
                                    e.target.value,
                                  );
                                  // Clear working hours error when user makes changes
                                  if (errors.workingHours) {
                                    setErrors({ ...errors, workingHours: undefined });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={wh.hasBreak}
                              onChange={(e) =>
                                updateWorkingHours(
                                  i,
                                  "hasBreak",
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              Has break time
                            </span>
                          </label>

                          {wh.hasBreak && (
                            <div className="grid grid-cols-2 gap-3 pl-6 pt-2 border-l-2 border-gray-200">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                  Break starts
                                </label>
                                <input
                                  type="time"
                                  value={wh.breakStart || "12:00"}
                                  onChange={(e) =>
                                    updateWorkingHours(
                                      i,
                                      "breakStart",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                  Break ends
                                </label>
                                <input
                                  type="time"
                                  value={wh.breakEnd || "13:00"}
                                  onChange={(e) =>
                                    updateWorkingHours(
                                      i,
                                      "breakEnd",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center py-2">
                          Not operating on this day
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    No working hours configured
                  </p>
                  <p className="text-xs text-gray-500">
                    Working hours will be initialized when you save the branch
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Action Buttons - Sticky Footer */}
        <div className="flex gap-3 pt-2 mt-2 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{editingBranch ? "Update Branch" : "Create Branch"}</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};