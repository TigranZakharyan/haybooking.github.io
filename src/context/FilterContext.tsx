// src/context/FilterContext.tsx
import { createContext, useContext, useState } from "react";

type FilterContextType = {
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void,
  handleFilterChange: (filters: any) => void;
};

const FilterContext = createContext<FilterContextType>({
  selectedBranchId: null,
  setSelectedBranchId: () => {},
  handleFilterChange: () => {},
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const handleFilterChange = (filters: any) => {
    setSelectedBranchId(filters.branch ?? null);
  };

  return (
    <FilterContext.Provider value={{ selectedBranchId, setSelectedBranchId, handleFilterChange, }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext);