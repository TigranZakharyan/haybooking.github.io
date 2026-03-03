import { MapPin, Phone, Clock, X, Trash2 } from "lucide-react";
import { Card, Button, Input, Select } from "@/components";
import { SwitchTabs } from "@/components/SwitchTabs";
import { PhoneInput } from "@/components/PhoneInput";
import type { TBranch, TCreateBranch, TWorkingHour } from "@/types";
import { cities, countries, weekdays } from "@/constants";
import { useState, useCallback, useMemo } from "react";

interface BranchFormProps {
  form: TCreateBranch;
  setForm: (form: TCreateBranch) => void;
  editingBranch: TBranch | null;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

interface FormErrors {
  street?: string;
  country?: string;
  city?: string;
  phones?: string[];
  workingHours?: string;
}

const DEFAULT_BREAK_START = "12:00";
const DEFAULT_BREAK_END = "13:00";

export const BranchForm = ({
  form,
  setForm,
  editingBranch,
  saving,
  onSave,
  onCancel,
}: BranchFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("location");
  const [errors, setErrors] = useState<FormErrors>({});

  // Memoized city options based on selected country
  const cityOptions = useMemo(() => 
    cities[form.address.country] || [], 
    [form.address.country]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorTab: string | null = null;

    // Validate Location tab
    if (!form.address.street.trim()) {
      newErrors.street = "Street address is required";
      firstErrorTab ??= "location";
    }
    if (!form.address.country) {
      newErrors.country = "Country is required";
      firstErrorTab ??= "location";
    }
    if (!form.address.city) {
      newErrors.city = "City is required";
      firstErrorTab ??= "location";
    }

    // Validate Phones tab
    const phoneErrors: string[] = [];
    const hasValidPhone = form.phones.some(phone => phone.trim());

    form.phones.forEach((phone, index) => {
      phoneErrors[index] = !phone.trim() ? "Phone number is required" : "";
    });

    if (!hasValidPhone) {
      newErrors.phones = phoneErrors;
      firstErrorTab ??= "phones";
    } else if (phoneErrors.some(Boolean)) {
      newErrors.phones = phoneErrors;
      firstErrorTab ??= "phones";
    }

    // Validate Working Hours tab
    if (form.workingHours?.length) {
      const hasOpenDay = form.workingHours.some(wh => wh.isOpen);
      const invalidHours = form.workingHours.some(wh => 
        wh.isOpen && (!wh.openTime || !wh.closeTime)
      );
      const invalidBreakHours = form.workingHours.some(wh => 
        wh.isOpen && wh.hasBreak && (!wh.breakStart || !wh.breakEnd)
      );

      if (!hasOpenDay) {
        newErrors.workingHours = "At least one day must be open";
        firstErrorTab ??= "hours";
      } else if (invalidHours) {
        newErrors.workingHours = "Please set opening and closing times for all open days";
        firstErrorTab ??= "hours";
      } else if (invalidBreakHours) {
        newErrors.workingHours = "Please set break start and end times for all days with breaks";
        firstErrorTab ??= "hours";
      }
    }

    setErrors(newErrors);

    if (firstErrorTab) {
      setActiveTab(firstErrorTab);
    }

    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSave = useCallback(() => {
    if (validateForm()) {
      onSave();
    }
  }, [validateForm, onSave]);

  // Phone handlers
  const addPhone = useCallback(() => {
    setForm({ ...form, phones: [...form.phones, ""] });
    if (errors.phones) {
      setErrors(prev => ({ ...prev, phones: undefined }));
    }
  }, [form, errors.phones, setForm]);

  const updatePhone = useCallback((index: number, value: string | null) => {
    const updated = [...form.phones];
    updated[index] = value || "";
    setForm({ ...form, phones: updated });
    
    if (errors.phones?.[index]) {
      setErrors(prev => ({
        ...prev,
        phones: prev.phones?.map((err, i) => i === index ? "" : err)
      }));
    }
  }, [form, errors.phones, setForm]);

  const removePhone = useCallback((index: number) => {
    if (form.phones.length === 1) return;
    setForm({
      ...form,
      phones: form.phones.filter((_, i) => i !== index),
    });
  }, [form, setForm]);

  // Working hours handler
  const updateWorkingHours = useCallback((
    index: number,
    field: keyof TWorkingHour,
    value: any,
  ) => {
    const updated = [...form.workingHours];
    
    if (field === 'hasBreak' && value === true) {
      updated[index] = { 
        ...updated[index], 
        hasBreak: true,
        breakStart: updated[index].breakStart || DEFAULT_BREAK_START,
        breakEnd: updated[index].breakEnd || DEFAULT_BREAK_END
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setForm({ ...form, workingHours: updated });
    
    if (errors.workingHours) {
      setErrors(prev => ({ ...prev, workingHours: undefined }));
    }
  }, [form, errors.workingHours, setForm]);

  // Address field handlers
  const updateAddressField = useCallback((
    field: keyof typeof form.address,
    value: string
  ) => {
    setForm({
      ...form,
      address: { ...form.address, [field]: value },
    });
    
    // Clear corresponding error
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [form, errors, setForm]);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  // Tab configurations
  const tabs = useMemo(() => [
    { id: "location", label: "Location", icon: MapPin },
    { id: "phones", label: "Phones", icon: Phone },
    { id: "hours", label: "Hours", icon: Clock },
  ], []);

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        {/* Header */}
        <div className="justify-center border-b mb-2 border-gray-200 relative">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingBranch ? "Edit Branch" : "Add New Branch"}
            </h2>
            <div className="w-full my-2">
              <SwitchTabs
                tabs={tabs.map(t => t.id)}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>
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
                  onChange={(e) => updateAddressField("street", e.target.value)}
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
                      updateAddressField("country", value);
                      // Reset city when country changes
                      setForm({
                        ...form,
                        address: { ...form.address, country: value, city: "" }
                      });
                    }}
                    error={errors.country}
                    required
                  />
                  <Select
                    options={cityOptions}
                    label="City"
                    placeholder="Select City"
                    value={form.address.city}
                    onChange={(value) => updateAddressField("city", value)}
                    error={errors.city}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="State/Province"
                    placeholder="Optional"
                    value={form.address.state}
                    onChange={(e) => updateAddressField("state", e.target.value)}
                  />
                  <Input
                    label="Zip/Postal Code"
                    placeholder="e.g., 0010"
                    value={form.address.zipCode}
                    onChange={(e) => updateAddressField("zipCode", e.target.value)}
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
                  disabled={form.phones.length >= 5}
                >
                  Add Phone
                </Button>
              </div>

              <div className="space-y-3">
                {form.phones.map((phone, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <PhoneInput
                        label={i === 0 ? "Primary Phone" : `Additional Phone ${i}`}
                        hint={i === 0 ? "Main contact number for this branch" : undefined}
                        error={errors.phones?.[i]}
                        required={i === 0}
                        value={phone}
                        onChange={(value) => updatePhone(i, value)}
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

              {form.workingHours?.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {form.workingHours.map((wh, i) => (
                    <div
                      key={wh.dayOfWeek}
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
                              clearError("workingHours");
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
                                value={wh.openTime || ""}
                                onChange={(e) => {
                                  updateWorkingHours(i, "openTime", e.target.value);
                                  clearError("workingHours");
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
                                value={wh.closeTime || ""}
                                onChange={(e) => {
                                  updateWorkingHours(i, "closeTime", e.target.value);
                                  clearError("workingHours");
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
                              onChange={(e) => {
                                updateWorkingHours(i, "hasBreak", e.target.checked);
                                clearError("workingHours");
                              }}
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
                                  value={wh.breakStart || DEFAULT_BREAK_START}
                                  onChange={(e) => {
                                    updateWorkingHours(i, "breakStart", e.target.value);
                                    clearError("workingHours");
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                  Break ends
                                </label>
                                <input
                                  type="time"
                                  value={wh.breakEnd || DEFAULT_BREAK_END}
                                  onChange={(e) => {
                                    updateWorkingHours(i, "breakEnd", e.target.value);
                                    clearError("workingHours");
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
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