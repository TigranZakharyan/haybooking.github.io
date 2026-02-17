import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar,
  Award,
  Download,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { businessService, bookingService } from '@/services/api';
import { Select } from '@/components';


interface Price {
  amount: number;
  currency?: string;
}

interface Service {
  name: string;
}

interface Specialist {
  name: string;
}

interface Booking {
  _id?: string;
  bookingDate: string;
  createdAt: string;
  status: 'completed' | 'confirmed' | 'pending' | 'cancelled';
  price?: Price;
  service?: Service;
  specialist?: Specialist;
}

interface Business {
  businessName: string;
}

interface DailyDataEntry {
  date: string;
  bookings: number;
  revenue: number;
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

interface ServiceDataEntry {
  name: string;
  count: number;
  revenue: number;
}

interface SpecialistDataEntry {
  name: string;
  count: number;
  revenue: number;
}

interface StatusPieEntry {
  name: string;
  value: number;
  color: string;
}

interface RadialDataEntry {
  name: string;
  value: number;
  fill: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AnalyticsPage = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [businessData, bookingsData] = await Promise.all([
        businessService.getMyBusiness(),
        bookingService.getBusinessBookings({})
      ]);
      setBusiness(businessData);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = (): Booking[] => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return bookings.filter(
      (booking) => new Date(booking.bookingDate).getTime() >= cutoffDate.getTime()
    );
  };

  const filteredBookings = getFilteredBookings();

  const totalRevenue = filteredBookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.price?.amount || 0), 0);

  const totalBookings = filteredBookings.length;
  const completedBookings = filteredBookings.filter((b) => b.status === 'completed').length;
  const confirmedBookings = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const pendingBookings = filteredBookings.filter((b) => b.status === 'pending').length;
  const cancelledBookings = filteredBookings.filter((b) => b.status === 'cancelled').length;

  const getPreviousPeriodBookings = (): number => {
    const days = parseInt(timeRange);
    const currentEnd = new Date();
    const currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() - days);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);

    return bookings.filter((booking) => {
      const date = new Date(booking.bookingDate);
      return (
        date.getTime() >= previousStart.getTime() &&
        date.getTime() < currentStart.getTime()
      );
    }).length;
  };

  const previousBookings = getPreviousPeriodBookings();
  const bookingGrowth: number =
    previousBookings > 0
      ? parseFloat((((totalBookings - previousBookings) / previousBookings) * 100).toFixed(1))
      : totalBookings > 0
      ? 100
      : 0;

  const getDailyData = (): DailyDataEntry[] => {
    const days = parseInt(timeRange);
    const dailyMap = new Map<string, DailyDataEntry>();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap.set(dateStr, {
        date: dateStr,
        bookings: 0,
        revenue: 0,
        completed: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
      });
    }

    filteredBookings.forEach((booking) => {
      const dateStr = new Date(booking.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const data = dailyMap.get(dateStr);
      if (data) {
        data.bookings++;
        const status = booking.status;
        if (status in data) {
          (data[status as keyof DailyDataEntry] as number)++;
        }
        if (['confirmed', 'completed'].includes(status)) {
          data.revenue += booking.price?.amount || 0;
        }
      }
    });

    return Array.from(dailyMap.values());
  };

  const getServiceData = (): ServiceDataEntry[] => {
    const serviceMap = new Map<string, ServiceDataEntry>();
    filteredBookings.forEach((booking) => {
      const name = booking.service?.name || 'Unknown';
      const existing = serviceMap.get(name) || { name, count: 0, revenue: 0 };
      existing.count++;
      if (['confirmed', 'completed'].includes(booking.status)) {
        existing.revenue += booking.price?.amount || 0;
      }
      serviceMap.set(name, existing);
    });
    return Array.from(serviceMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const getSpecialistData = (): SpecialistDataEntry[] => {
    const specialistMap = new Map<string, SpecialistDataEntry>();
    filteredBookings.forEach((booking) => {
      const name = booking.specialist?.name || 'Unknown';
      const existing = specialistMap.get(name) || { name, count: 0, revenue: 0 };
      existing.count++;
      if (['confirmed', 'completed'].includes(booking.status)) {
        existing.revenue += booking.price?.amount || 0;
      }
      specialistMap.set(name, existing);
    });
    return Array.from(specialistMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const dailyData = getDailyData();
  const serviceData = getServiceData();
  const specialistData = getSpecialistData();

  const completionRate: number =
    totalBookings > 0 ? parseInt((completedBookings / totalBookings * 100).toFixed(0)) : 0;

  const radialData: RadialDataEntry[] = [
    { name: 'Completion', value: completionRate, fill: '#5D6B8D' },
  ];

  const statusPieData: StatusPieEntry[] = [
    { name: 'Completed', value: completedBookings, color: '#5D6B8D' },
    { name: 'Confirmed', value: confirmedBookings, color: '#b39595' },
    { name: 'Pending', value: pendingBookings, color: '#c4a882' },
    { name: 'Cancelled', value: cancelledBookings, color: '#c97a7a' },
  ].filter((item) => item.value > 0);

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-body">
            Analytics Dashboard
          </h1>
          {business?.businessName && (
            <p className="text-text-body/70 text-sm mt-0.5">
              {business.businessName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={timeRange}
            onChange={(value) => setTimeRange(value)}
            options={timeRangeOptions}
            className="w-full sm:w-48 border-liberty/20 focus:border-liberty"
          />

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 transition-opacity hover:opacity-85 bg-liberty text-white">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Total Bookings */}
        <KpiCard
          label="Total Bookings"
          value={totalBookings}
          sub={
            <div className="flex items-center mt-1 gap-1">
              {bookingGrowth >= 0
                ? <TrendingUp className="h-3 w-3 text-liberty" />
                : <TrendingDown className="h-3 w-3" style={{ color: '#c97a7a' }} />
              }
              <span
                className={`text-xs font-medium ${
                  bookingGrowth >= 0 ? 'text-liberty' : 'text-[#c97a7a]'
                }`}
              >
                {Math.abs(bookingGrowth)}% vs prev
              </span>
            </div>
          }
          icon={<Calendar className="h-4 w-4 text-secondary" />}
          chart={
            <LineChart data={dailyData.slice(-7)}>
              <Line type="monotone" dataKey="bookings" stroke="#b39595" strokeWidth={2} dot={false} />
            </LineChart>
          }
        />

        {/* Completed */}
        <KpiCard
          label="Completed"
          value={completedBookings}
          sub={
            <p className="text-text-body text-xs mt-1">
              {totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(0) : 0}% rate
            </p>
          }
          icon={<Award className="h-4 w-4 text-secondary" />}
          chart={
            <AreaChart data={dailyData.slice(-7)}>
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b39595" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#b39595" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="completed" stroke="#b39595" fill="url(#cg1)" strokeWidth={2} />
            </AreaChart>
          }
        />

        {/* Revenue */}
        <KpiCard
          label="Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          sub={
            <p className="text-text-body text-xs mt-1">
              ${(totalRevenue / Math.max(totalBookings, 1)).toFixed(0)} avg / booking
            </p>
          }
          icon={<DollarSign className="h-4 w-4 text-secondary" />}
          chart={
            <AreaChart data={dailyData.slice(-7)}>
              <defs>
                <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5D6B8D" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#5D6B8D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="revenue" stroke="#5D6B8D" fill="url(#cg2)" strokeWidth={2} />
            </AreaChart>
          }
        />

        {/* Cancelled */}
        <KpiCard
          label="Cancelled"
          value={cancelledBookings}
          sub={
            <p className="text-text-body text-xs mt-1">
              {totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(0) : 0}% rate
            </p>
          }
          icon={<Activity className="h-4 w-4 text-secondary" />}
          chart={
            <LineChart data={dailyData.slice(-7)}>
              <Line type="monotone" dataKey="cancelled" stroke="#c97a7a" strokeWidth={2} dot={false} />
            </LineChart>
          }
        />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* General Stats */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-[#ede8e4]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-liberty-dark">
              General Stats
            </h3>
            <div className="flex gap-2">
              <Chip active>Bookings</Chip>
              <Chip>Revenue</Chip>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b39595" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b39595" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede8e4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6a6a6a' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6a6a6a' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #ede8e4',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#6a6a6a',
                    boxShadow: '0 4px 16px rgba(179,149,149,0.12)'
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#b39595"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Split */}
        <div className="rounded-2xl p-6 bg-white border border-[#ede8e4]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-liberty-dark">
              Status Split
            </h3>
            <span className="text-liberty text-xs font-medium cursor-pointer hover:text-liberty-dark transition-colors">
              Details
            </span>
          </div>
          <div className="flex items-center justify-center h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #ede8e4',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#6a6a6a',
                    boxShadow: '0 4px 16px rgba(179,149,149,0.12)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2.5">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-body">{item.name}</span>
                </div>
                <span className="font-semibold text-liberty-dark">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Services */}
        <div className="rounded-2xl p-6 bg-white border border-[#ede8e4]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-liberty-dark">Services</h3>
            <span className="text-liberty text-xs font-medium cursor-pointer hover:text-liberty-dark transition-colors">
              View All
            </span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede8e4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#6a6a6a' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  angle={-15}
                  textAnchor="end"
                  height={40}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #ede8e4',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#6a6a6a',
                    boxShadow: '0 4px 16px rgba(179,149,149,0.12)'
                  }} 
                />
                <Bar dataKey="count" fill="#b39595" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Pattern */}
        <div className="rounded-2xl p-6 bg-white border border-[#ede8e4]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-liberty-dark">Daily Pattern</h3>
            <span className="text-liberty text-xs font-medium cursor-pointer hover:text-liberty-dark transition-colors">
              Details
            </span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede8e4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#6a6a6a' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #ede8e4',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#6a6a6a',
                    boxShadow: '0 4px 16px rgba(179,149,149,0.12)'
                  }} 
                />
                <Bar dataKey="confirmed" stackId="a" fill="#b39595" />
                <Bar dataKey="pending" stackId="a" fill="#c4a882" />
                <Bar dataKey="completed" stackId="a" fill="#5D6B8D" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-2xl p-6 bg-white border border-[#ede8e4]">
          <h3 className="text-base font-semibold mb-4 text-liberty-dark">
            Performance
          </h3>

          {/* Radial */}
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-[140px] h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="80%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: '#ede8e4' }}
                    dataKey="value"
                    cornerRadius={10}
                    fill="#5D6B8D"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-liberty-dark">
                  {completionRate}%
                </p>
                <p className="text-text-body text-xs">Completion</p>
              </div>
            </div>
          </div>

          {/* Top Specialists */}
          <div className="space-y-3">
            {specialistData.slice(0, 4).map((specialist, idx) => {
              const maxCount = Math.max(...specialistData.map((s) => s.count));
              const pct = maxCount > 0 ? (specialist.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-primary/20 text-secondary"
                  >
                    {idx + 1}
                  </div>
                  <span className="text-sm flex-1 min-w-0 truncate text-text-body">
                    {specialist.name}
                  </span>
                  <div className="w-16 rounded-full h-1.5 flex-shrink-0 bg-[#ede8e4]">
                    <div
                      className="h-1.5 rounded-full bg-liberty"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold flex-shrink-0 text-liberty-dark">
                    {specialist.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | string;
  sub: React.ReactNode;
  icon: React.ReactNode;
  chart: React.ReactNode;
}

const KpiCard = ({ label, value, sub, icon, chart }: KpiCardProps) => (
  <div className="rounded-2xl p-4 bg-white border border-[#ede8e4]">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-text-body">
        {label}
      </span>
      {icon}
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-3xl font-bold text-liberty-dark">
          {value}
        </p>
        {sub}
      </div>
      <div className="h-12 w-20 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          {chart as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
}

const Chip = ({ children, active }: ChipProps) => (
  <button
    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
      active 
        ? 'bg-primary/20 text-secondary' 
        : 'text-text-body hover:bg-primary/10'
    }`}
  >
    {children}
  </button>
);