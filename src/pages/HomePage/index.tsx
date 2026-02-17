import { useState, useEffect } from 'react';
import { Button, Container, Input, Select } from "@/components";
import { Modal } from './Modal';
import { searchService } from '@/services/api';
import type { Business, TBusinessType } from '@/types';
import { ServiceCard } from './ServiceCard'

interface Filters {
  q: string;
  city: string;
  type: string;
}

export function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<TBusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    q: '',
    city: '',
    type: 'all',
  });
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [citiesData, typesData, businessesData] = await Promise.all([
        searchService.getCities(),
        searchService.getBusinessTypes(),
        searchService.searchBusinesses({}),
      ]);
      setCities(citiesData);
      setTypes(typesData);
      setBusinesses(businessesData.businesses);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await searchService.searchBusinesses(filters);
      setBusinesses(result.businesses);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (business: Business) => {
    setSelectedBusiness(business);
  };

  const handleCloseModal = () => {
    setSelectedBusiness(null);
  };

  const handleConfirmed = (payload: {
    booking: unknown;
    selectedService: unknown;
    selectedSpecialist: unknown;
    customerInfo: unknown;
  }) => {
    console.log('Booking confirmed:', payload);
    setSelectedBusiness(null);
  };

  if (loading && businesses.length === 0) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Container>
    );
  }

  console.log(businesses)

  return (
    <>
      <Container>
        <h2 className="uppercase">Find & book services</h2>

        {/* Search filters */}
        <div className="grid grid-cols-4 gap-6 my-8">
          <Input
            variant="primary"
            placeholder="Search..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <Select
            variant="primary"
            options={cities.map(city => ({ value: city, label: city }))}
            placeholder="All Cities"
            value={filters.city}
            onChange={(value) => setFilters({ ...filters, city: value as string })}
          />
          <Select
            variant="primary"
            options={[{ value: 'all', label: 'All Types' }, ...types]}
            placeholder="All Types"
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value as string })}
          />
          <Button
            onClick={handleSearch}
            className="bg-primary text-white font-bold hover:bg-primary/95 shadow-xl"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Results */}
        <div className="flex gap-12 flex-wrap">
          {businesses.length === 0 ? (
            <div className="w-full text-center py-12">
              <p className="text-xl font-semibold text-gray-700">No businesses found.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
            </div>
          ) : (
            businesses.map((business) => (
              <ServiceCard
                key={business._id}
                image={business.image}
                title={business.businessName}
                address={business.address}
                specialists={business.specialists?.length || 0}
                services={business.services?.length || 0}
                priceFrom={business.services?.[0]?.price?.amount || 0}
                buttonText="Book Now"
                onButtonClick={() => handleBookingClick(business)}
              />
            ))
          )}
        </div>
      </Container>

      {/* Booking Modal */}
      {selectedBusiness && (
        <Modal
          business={selectedBusiness}
          onClose={handleCloseModal}
          onConfirmed={handleConfirmed}
        />
      )}
    </>
  );
}