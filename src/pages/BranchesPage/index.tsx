import { useState, useEffect } from "react";
import { branchesService, businessService } from "@/services/api";
import { Button, Card } from "@/components";
import type { TBranch, TCreateBranch } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { BranchList } from "./BranchList";
import { BranchMap } from "./BranchMap";
import { BranchForm } from "./BranchForm.tsx";
import { weekdays } from "@/constants/calendar.ts";

export const BranchesPage = () => {
  const { user } = useAuth();

  const [branches, setBranches] = useState<TBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<TBranch | null>(null);
  const [editingBranch, setEditingBranch] = useState<TBranch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  // Track which panel is active on mobile: "list" | "detail"
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");

  const emptyBranch: TCreateBranch = {
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    phones: [""],
    workingHours: weekdays.map((_, index) => ({
      dayOfWeek: index,
      isOpen: index < 5,
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: false,
    })),
    isBaseBranch: false,
  };

  const [form, setForm] = useState<TCreateBranch | TBranch>(emptyBranch);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const business = await businessService.getMyBusiness();
      setBranches(business.branches || []);
      if (business.branches?.length && !selectedBranch) {
        setSelectedBranch(business.branches[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingBranch) {
        await branchesService.updateMyBranch(editingBranch._id, form);
      } else {
        const businessId = user?.business?.id;
        if (!businessId) {
          console.error("No business ID available to create branch");
          return;
        }
        await branchesService.createBranch(businessId, form);
      }
      await fetchBranches();
      setShowForm(false);
      setEditingBranch(null);
      setForm(emptyBranch);
      setMobilePanel("list");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (branch: TBranch) => {
    setEditingBranch(branch);
    setShowForm(true);
    setForm(branch);
    setMobilePanel("detail");

    setTimeout(() => {
      const formElement = document.getElementById("branch-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      await branchesService.deleteBranch(branchId);
      await fetchBranches();
      if (selectedBranch?._id === branchId) {
        setSelectedBranch(null);
        setMobilePanel("list");
      }
    } catch (error) {
      console.error("Failed to delete branch:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBranch(null);
    setForm(emptyBranch);
    setMobilePanel("list");
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingBranch(null);
    setForm(emptyBranch);
    setMobilePanel("detail");
  };

  const handleSelectBranch = (branch: TBranch) => {
    setSelectedBranch(branch);
    setShowForm(false);
    setMobilePanel("detail");
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading branches...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 gap-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Business Branches</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
            Manage your business locations and working hours
          </p>
        </div>
        <Button
          variant="default"
          onClick={handleAddNew}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Add Branch</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Mobile: back button when showing detail panel */}
      {mobilePanel === "detail" && (
        <div className="flex-shrink-0 lg:hidden">
          <button
            onClick={() => {
              setMobilePanel("list");
              setShowForm(false);
              setEditingBranch(null);
            }}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to list
          </button>
        </div>
      )}

      {/* Layout */}
      <div className="flex-1 overflow-hidden lg:grid lg:grid-cols-[minmax(300px,1fr)_2fr] lg:gap-5">

        {/* Left Column — Branch List */}
        {/* On mobile: visible only when mobilePanel === "list" */}
        <div
          className={`
            h-full overflow-y-auto
            ${mobilePanel === "list" ? "block" : "hidden"}
            lg:block
          `}
        >
          <BranchList
            branches={branches}
            selectedBranch={selectedBranch}
            onSelectBranch={handleSelectBranch}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={handleAddNew}
          />
        </div>

        {/* Right Column — Map or Form */}
        {/* On mobile: visible only when mobilePanel === "detail" */}
        <div
          className={`
            h-full overflow-y-auto
            ${mobilePanel === "detail" ? "block" : "hidden"}
            lg:block
          `}
        >
          {showForm ? (
            <BranchForm
              form={form}
              setForm={setForm}
              editingBranch={editingBranch}
              saving={saving}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <BranchMap
              branches={branches}
              selectedBranch={selectedBranch}
            />
          )}
        </div>
      </div>
    </div>
  );
};