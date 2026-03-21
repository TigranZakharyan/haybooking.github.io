import { MapPin, Phone, Clock, X, Trash2 } from "lucide-react";
import { Card, Button, Input, Select } from "@/components";
import { SwitchTabs } from "@/components/SwitchTabs";
import { PhoneInput } from "@/components/PhoneInput";
import type { TBranch, TCreateBranch, TWorkingHour } from "@/types";
import { cities, countries, weekdays } from "@/constants";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

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

export const BranchForm = ({ form, setForm, editingBranch, saving, onSave, onCancel }: BranchFormProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("location");
  const [errors, setErrors] = useState<FormErrors>({});

  const cityOptions = useMemo(() => cities[form.address.country] || [], [form.address.country]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorTab: string | null = null;

    if (!form.address.street.trim()) {
      newErrors.street = t("errors.required");
      firstErrorTab ??= "location";
    }
    if (!form.address.country) {
      newErrors.country = t("errors.required");
      firstErrorTab ??= "location";
    }
    if (!form.address.city) {
      newErrors.city = t("errors.required");
      firstErrorTab ??= "location";
    }

    const phoneErrors: string[] = [];
    const hasValidPhone = form.phones.some(phone => phone.trim());
    form.phones.forEach((phone, index) => {
      phoneErrors[index] = !phone.trim() ? t("errors.phoneRequired") : "";
    });

    if (!hasValidPhone) {
      newErrors.phones = phoneErrors;
      firstErrorTab ??= "phones";
    } else if (phoneErrors.some(Boolean)) {
      newErrors.phones = phoneErrors;
      firstErrorTab ??= "phones";
    }

    if (form.workingHours?.length) {
      const hasOpenDay = form.workingHours.some(wh => wh.isOpen);
      const invalidHours = form.workingHours.some(wh => wh.isOpen && (!wh.openTime || !wh.closeTime));
      const invalidBreakHours = form.workingHours.some(wh => wh.isOpen && wh.hasBreak && (!wh.breakStart || !wh.breakEnd));

      if (!hasOpenDay) {
        newErrors.workingHours = t("errors.atLeastOneDay");
        firstErrorTab ??= "hours";
      } else if (invalidHours) {
        newErrors.workingHours = t("errors.setOpenCloseTimes");
        firstErrorTab ??= "hours";
      } else if (invalidBreakHours) {
        newErrors.workingHours = t("errors.setBreakTimes");
        firstErrorTab ??= "hours";
      }
    }

    setErrors(newErrors);
    if (firstErrorTab) setActiveTab(firstErrorTab);
    return Object.keys(newErrors).length === 0;
  }, [form, t]);

  const handleSave = useCallback(() => {
    if (validateForm()) onSave();
  }, [validateForm, onSave]);

  const addPhone = useCallback(() => {
    setForm({ ...form, phones: [...form.phones, ""] });
    if (errors.phones) setErrors(prev => ({ ...prev, phones: undefined }));
  }, [form, errors.phones, setForm]);

  const updatePhone = useCallback((index: number, value: string | null) => {
    const updated = [...form.phones];
    updated[index] = value || "";
    setForm({ ...form, phones: updated });
    if (errors.phones?.[index]) {
      setErrors(prev => ({ ...prev, phones: prev.phones?.map((err, i) => i === index ? "" : err) }));
    }
  }, [form, errors.phones, setForm]);

  const removePhone = useCallback((index: number) => {
    if (form.phones.length === 1) return;
    setForm({ ...form, phones: form.phones.filter((_, i) => i !== index) });
  }, [form, setForm]);

  const updateWorkingHours = useCallback((index: number, field: keyof TWorkingHour, value: any) => {
    const updated = [...form.workingHours];
    if (field === "hasBreak" && value === true) {
      updated[index] = { ...updated[index], hasBreak: true, breakStart: updated[index].breakStart || DEFAULT_BREAK_START, breakEnd: updated[index].breakEnd || DEFAULT_BREAK_END };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setForm({ ...form, workingHours: updated });
    if (errors.workingHours) setErrors(prev => ({ ...prev, workingHours: undefined }));
  }, [form, errors.workingHours, setForm]);

  const updateAddressField = useCallback((field: keyof typeof form.address, value: string) => {
    setForm({ ...form, address: { ...form.address, [field]: value } });
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [form, errors, setForm]);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const tabs = useMemo(() => [
    { id: "location", label: t("branches.tabs.location"), icon: MapPin },
    { id: "phones", label: t("branches.tabs.phones"), icon: Phone },
    { id: "hours", label: t("branches.tabs.hours"), icon: Clock },
  ], [t]);

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <div className="justify-center border-b mb-2 border-gray-200 relative">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingBranch ? t("branches.editBranchTitle") : t("branches.addBranchTitle")}
            </h2>
            <div className="w-full my-2">
              <SwitchTabs tabs={tabs.map(tab => tab.id)} activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors absolute right-0 top-0" aria-label={t("branches.close")}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="min-h-[400px] px-1">

          {/* Location Tab */}
          {activeTab === "location" && (
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{t("branches.locationDetails")}</h3>
                  <p className="text-xs text-gray-500">{t("branches.enterAddress")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label={t("branches.streetAddress")}
                  placeholder={t("branches.streetPlaceholder")}
                  value={form.address.street}
                  onChange={(e) => updateAddressField("street", e.target.value)}
                  error={errors.street}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    options={countries}
                    label={t("branches.country")}
                    placeholder={t("branches.selectCountry")}
                    value={form.address.country}
                    onChange={(value) => {
                      updateAddressField("country", value);
                      setForm({ ...form, address: { ...form.address, country: value, city: "" } });
                    }}
                    error={errors.country}
                    required
                  />
                  <Select
                    options={cityOptions}
                    label={t("branches.city")}
                    placeholder={t("branches.selectCity")}
                    value={form.address.city}
                    onChange={(value) => updateAddressField("city", value)}
                    error={errors.city}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("branches.stateProvince")}
                    placeholder={t("branches.optional")}
                    value={form.address.state}
                    onChange={(e) => updateAddressField("state", e.target.value)}
                  />
                  <Input
                    label={t("branches.zipCode")}
                    placeholder={t("branches.zipPlaceholder")}
                    value={form.address.zipCode}
                    onChange={(e) => updateAddressField("zipCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300 transition-colors">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isBaseBranch}
                      onChange={(e) => setForm({ ...form, isBaseBranch: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 cursor-pointer mt-0.5 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="block text-base font-semibold text-gray-900 mb-1">
                        {t("branches.setAsBase")}
                      </span>
                      <p className="text-sm text-gray-600">{t("branches.setAsBaseHint")}</p>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Phones Tab */}
          {activeTab === "phones" && (
            <section className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {t("branches.contactNumbers")} <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-gray-500">{t("branches.addPhoneHint")}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={addPhone} className="text-sm flex items-center gap-1.5" disabled={form.phones.length >= 5}>
                  {t("branches.addPhone")}
                </Button>
              </div>

              <div className="space-y-3">
                {form.phones.map((phone, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <PhoneInput
                        label={i === 0 ? t("branches.primaryPhone") : `${t("branches.additionalPhone")} ${i}`}
                        hint={i === 0 ? t("branches.primaryPhoneHint") : undefined}
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
                        aria-label={t("branches.removePhone")}
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
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("branches.noPhonesAdded")}</p>
                  <p className="text-xs text-gray-500 mb-4">{t("branches.noPhonesHint")}</p>
                  <Button variant="outline" onClick={addPhone} className="text-sm">
                    {t("branches.addFirstPhone")}
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Hours Tab */}
          {activeTab === "hours" && (
            <section className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {t("branches.businessHours")} <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-gray-500">{t("branches.setHoursHint")}</p>
                  </div>
                </div>
              </div>

              {errors.workingHours && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{errors.workingHours}</p>
                </div>
              )}

              {form.workingHours?.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {form.workingHours.map((wh, i) => (
                    <div
                      key={wh.dayOfWeek}
                      className={`border rounded-xl p-4 transition-all ${wh.isOpen ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-900">{weekdays[wh.dayOfWeek]}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={wh.isOpen}
                            onChange={(e) => { updateWorkingHours(i, "isOpen", e.target.checked); clearError("workingHours"); }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {wh.isOpen ? t("branches.open") : t("branches.closed")}
                          </span>
                        </label>
                      </div>

                      {wh.isOpen ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("branches.opensAt")}</label>
                              <input
                                type="time"
                                value={wh.openTime || ""}
                                onChange={(e) => { updateWorkingHours(i, "openTime", e.target.value); clearError("workingHours"); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("branches.closesAt")}</label>
                              <input
                                type="time"
                                value={wh.closeTime || ""}
                                onChange={(e) => { updateWorkingHours(i, "closeTime", e.target.value); clearError("workingHours"); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={wh.hasBreak}
                              onChange={(e) => { updateWorkingHours(i, "hasBreak", e.target.checked); clearError("workingHours"); }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{t("branches.hasBreak")}</span>
                          </label>

                          {wh.hasBreak && (
                            <div className="grid grid-cols-2 gap-3 pl-6 pt-2 border-l-2 border-gray-200">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("branches.breakStarts")}</label>
                                <input
                                  type="time"
                                  value={wh.breakStart || DEFAULT_BREAK_START}
                                  onChange={(e) => { updateWorkingHours(i, "breakStart", e.target.value); clearError("workingHours"); }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("branches.breakEnds")}</label>
                                <input
                                  type="time"
                                  value={wh.breakEnd || DEFAULT_BREAK_END}
                                  onChange={(e) => { updateWorkingHours(i, "breakEnd", e.target.value); clearError("workingHours"); }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center py-2">{t("branches.notOperating")}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("branches.noHoursConfigured")}</p>
                  <p className="text-xs text-gray-500">{t("branches.noHoursHint")}</p>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="flex gap-3 pt-2 mt-2 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} className="flex-1" disabled={saving}>
            {t("branches.cancel")}
          </Button>
          <Button variant="default" onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>{t("branches.saving")}</span>
              </>
            ) : (
              <span>{editingBranch ? t("branches.updateBranch") : t("branches.createBranch")}</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};  