import { useState, useEffect } from 'react';
import { Button, Container, Input, Select, BookingModal, Pagination } from "@/components";
import { businessService, searchService } from '@/services/api';
import type { TBusiness, TBusinessType, TPagination, TSearchBusinessParams } from '@/types';
import { ServiceCard } from './ServiceCard'

export function HomePage() {
  const [businesses, setBusinesses] = useState<TBusiness[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<TBusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<TPagination>()
  const [filters, setFilters] = useState<TSearchBusinessParams>({
    q: '',
    city: '',
    type: 'all',
  });
  const [selectedBusiness, setSelectedBusiness] = useState<TBusiness | null>(null);

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
      setPagination(businessesData.pagination)
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
    setLoading(true);
    try {
      const result = await searchService.searchBusinesses({ ...filters, page });
      console.log(result)
      setBusinesses(result.businesses);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingClick = async (business: TBusiness) => {
    const fetchBusinessDetails = await businessService.getBusinessByLink(business.bookingLink)
    setSelectedBusiness(fetchBusinessDetails);
  };

  const handleCloseModal = () => {
    setSelectedBusiness(null);
  };

  const handleConfirmed = () => {
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
            onClick={() => handleSearch(1)}
            className="bg-primary text-white font-bold hover:bg-primary/95 shadow-xl"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Results */}
        <div className="flex gap-12 flex-wrap mb-8">
          {businesses.length === 0 ? (
            <div className="w-full text-center py-12">
              <p className="text-xl font-semibold text-gray-700">No businesses found.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
            </div>
          ) : (
            businesses.map((business) => (
              <ServiceCard
                key={business.id}
                title={business.businessName}
                logo={business.logo}
                specialists={business.specialists?.length || 0}
                services={business.services?.length || 0}
                priceFrom={business.services?.[0]?.price?.amount || 0}
                buttonText="Book Now"
                onButtonClick={() => handleBookingClick(business)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
      </Container>

      {/* Booking Modal */}
      {selectedBusiness && (
        <BookingModal
          business={selectedBusiness}
          onClose={handleCloseModal}
          onConfirmed={handleConfirmed}
        />
      )}
    </>
  );
}