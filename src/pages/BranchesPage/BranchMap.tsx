import { Phone, Clock } from "lucide-react";
import { Card, MapWithCoords } from "@/components";
import type { Branch } from "@/types";
import { weekdays } from "@/constants/calendar";

interface BranchMapProps {
  branches: Branch[];
  selectedBranch: Branch | null;
}

export const BranchMap = ({ branches, selectedBranch }: BranchMapProps) => {
  return (
    <Card className="h-full">
      <div className="h-full space-y-4 flex flex-col">
        {/* Google Map */}
        <MapWithCoords
          points={branches
            .filter((e) => e.address.coordinates.latitude)
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
              {selectedBranch.isBaseBranch && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  BASE BRANCH
                </span>
              )}
            </div>

            {selectedBranch.address.phones &&
              selectedBranch.address.phones.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{selectedBranch.address.phones.join(", ")}</span>
                  </div>
                </div>
              )}

            {selectedBranch.address.workingHours &&
              selectedBranch.address.workingHours.length > 0 && (
                <div>
                  <button
                    onClick={() => {
                      const details = document.getElementById(
                        `working-hours-${selectedBranch._id}`
                      );
                      if (details) {
                        details.classList.toggle("hidden");
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                  >
                    <Clock className="w-4 h-4" />
                    Show Working Hours
                  </button>
                  <div
                    id={`working-hours-${selectedBranch._id}`}
                    className="hidden space-y-2"
                  >
                    {selectedBranch.address.workingHours.map((wh) => (
                      <div
                        key={wh.dayOfWeek}
                        className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-700">
                          {weekdays[wh.dayOfWeek]}
                        </span>
                        {wh.isOpen ? (
                          <span className="text-gray-600">
                            {wh.openTime} - {wh.closeTime}
                            {wh.hasBreak &&
                              wh.breakStart &&
                              wh.breakEnd &&
                              ` (Break: ${wh.breakStart} - ${wh.breakEnd})`}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </Card>
  );
};