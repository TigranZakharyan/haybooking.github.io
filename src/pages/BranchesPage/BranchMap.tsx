import { lazy } from "react";
import { Badge, Card } from "@/components";
import type { TBranch } from "@/types";
import { useTranslation } from "react-i18next";

const MapWithCoords = lazy(() => import("@/components/MapWithCoords"));

interface BranchMapProps {
  branches: TBranch[];
  selectedBranch: TBranch | null;
}

export const BranchMap = ({ branches, selectedBranch }: BranchMapProps) => {
  const { t } = useTranslation();

  return (
    <Card className="h-full">
      <div className="h-full space-y-4 flex flex-col">
        <div className="flex-1 min-h-[240px] sm:min-h-[320px]">
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
            selectedPointId={selectedBranch ? selectedBranch._id : undefined}
          />
        </div>

        {selectedBranch && (
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                  {selectedBranch.address.street}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedBranch.address.city}, {selectedBranch.address.country}
                  {selectedBranch.address.state && `, ${selectedBranch.address.state}`}
                </p>
              </div>
              {selectedBranch.isBaseBranch && (
                <Badge variant="info">{t("branches.baseBranch")}</Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};