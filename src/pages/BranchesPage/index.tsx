import { useState, useEffect } from "react";
import { branchesService, businessService } from "@/services/api";
import { Plus } from "lucide-react";
import { Button, Card } from "@/components";
import type { Branch, NewBranch } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { BranchList } from "./BranchList";
import { BranchMap } from "./BranchMap";
import { BranchForm } from "./BranchForm.tsx";
import { weekdays } from "@/constants/calendar.ts";

export const BranchesPage = () => {
  const { user } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyBranch: NewBranch = {
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

  const [form, setForm] = useState<NewBranch | Branch>(emptyBranch);

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
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setShowForm(true);

    setForm(branch);

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
      }
    } catch (error) {
      console.error("Failed to delete branch:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBranch(null);
    setForm(emptyBranch);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingBranch(null);
    setForm(emptyBranch);
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
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Branches</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your business locations and working hours
          </p>
        </div>
        <Button
          variant="default"
          onClick={handleAddNew}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_2fr] gap-5 overflow-hidden">
        {/* Left Column - Branch List */}
        <BranchList
          branches={branches}
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />

        {/* Right Column - Map or Form */}
        <div className="h-full overflow-y-auto">
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