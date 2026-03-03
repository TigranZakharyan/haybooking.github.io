import { Badge, Card, MapWithCoords } from "@/components";
import type { TBranch } from "@/types";

interface BranchMapProps {
  branches: TBranch[];
  selectedBranch: TBranch | null;
}

export const BranchMap = ({ branches, selectedBranch }: BranchMapProps) => {
  return (
    <Card className="h-full">
      <div className="h-full space-y-4 flex flex-col">
        {/* Google Map */}
        <MapWithCoords
          points={branches
            .filter((e) => e.address.coordinates.latitude && e.address.coordinates.longitude)
            .map((e) => ({
              id: e._id,
              lat: e.address.coordinates.latitude,
              lng: e.address.coordinates.longitude,
              label: e.address.street,
              isBase: e.isBaseBranch,
            }))}
          selectedPoint={
            selectedBranch && selectedBranch.address.coordinates.latitude
              ? {
                  lat: selectedBranch.address.coordinates.latitude,
                  lng: selectedBranch.address.coordinates.longitude,
                  id: selectedBranch._id,
                }
              : undefined
          }
        />

        {/* Selected Branch Details */}
        {selectedBranch && (
          <div className="border-t pt-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {selectedBranch.address.street}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedBranch.address.city}, {selectedBranch.address.country}
                  {selectedBranch.address.state &&
                    `, ${selectedBranch.address.state}`}
                </p>
              </div>
              {selectedBranch.isBaseBranch && <Badge variant="info">Base Branch</Badge>}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};