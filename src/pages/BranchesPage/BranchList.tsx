import { MapPin, Phone, Edit, Trash2, Home, Plus } from "lucide-react";
import { Card, Button } from "@/components";
import type { Branch } from "@/types";

interface BranchListProps {
  branches: Branch[];
  selectedBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branchId: string) => void;
  onAddNew: () => void;
}

export const BranchList = ({
  branches,
  selectedBranch,
  onSelectBranch,
  onEdit,
  onDelete,
  onAddNew,
}: BranchListProps) => {
  if (branches.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 font-medium">No branches yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Add your first branch location to get started
          </p>
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Branch
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pl-1">
      {branches.map((branch) => (
        <Card
          key={branch._id}
          className={`cursor-pointer transition-all duration-200 ${
            selectedBranch?._id === branch._id
              ? "border-5 ring-primary bg-primary/5"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-start justify-between" onClick={() => onSelectBranch(branch)}>
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                {branch.isBaseBranch ? (
                  <Home className="w-5 h-5 text-primary" />
                ) : (
                  <MapPin className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {branch.address.street}
                  </h3>
                  {branch.isBaseBranch && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      BASE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {branch.address.city}, {branch.address.country}
                  {branch.address.state && `, ${branch.address.state}`}
                  {branch.address.zipCode && ` ${branch.address.zipCode}`}
                </p>
                {branch.address.phones && branch.address.phones.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    {branch.address.phones.join(", ")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(branch);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Edit branch"
              >
                <Edit size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(branch._id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Delete branch"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};