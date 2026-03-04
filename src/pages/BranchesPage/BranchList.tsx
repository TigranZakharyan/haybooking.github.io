import { MapPin, Phone, Edit, Trash2, Home } from "lucide-react";
import { Card, Button, YandexMapButton, GoogleMapButton, Badge } from "@/components";
import type { TBranch } from "@/types";

interface BranchListProps {
  branches: TBranch[];
  selectedBranch: TBranch | null;
  onSelectBranch: (branch: TBranch) => void;
  onEdit: (branch: TBranch) => void;
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
            Add Your First Branch
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 pl-1 pt-1">
      {branches.map((branch) => (
        <Card
          key={branch._id}
          className={`cursor-pointer transition-all duration-200 border-5 ${
            selectedBranch?._id === branch._id
              ? "border-primary ring-1 ring-primary/5 bg-primary"
              : "hover:bg-gray-50 border-transparent"
          }`}
        >
          <div
            className="flex items-stretch justify-between gap-2"
            onClick={() => onSelectBranch(branch)}
          >
            {/* Left Side: Icon and Address Info */}
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                {branch.isBaseBranch ? (
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                ) : (
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate mb-0.5">
                  {branch.address.street}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1.5 leading-relaxed">
                  {branch.address.city}, {branch.address.country}
                  {branch.address.state && `, ${branch.address.state}`}
                  {branch.address.zipCode && ` ${branch.address.zipCode}`}
                </p>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{branch.phones.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex flex-col justify-between items-end flex-shrink-0">
              {/* Top: Map + Edit + Delete buttons */}
              <div className="flex gap-0.5 sm:gap-1 items-center">
                <YandexMapButton {...branch.address.coordinates} />
                <GoogleMapButton {...branch.address.coordinates} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(branch);
                  }}
                  className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  aria-label="Edit branch"
                >
                  <Edit size={16} className="sm:hidden" />
                  <Edit size={18} className="hidden sm:block" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(branch._id);
                  }}
                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  aria-label="Delete branch"
                >
                  <Trash2 size={16} className="sm:hidden" />
                  <Trash2 size={18} className="hidden sm:block" />
                </button>
              </div>

              {/* Bottom: Badge */}
              {branch.isBaseBranch && (
                <Badge variant="info" className="text-xs">BASE</Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};