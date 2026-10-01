import { fetchApi } from './api';
import {
  AdminUser,
  AdminDestination,
  AdminAttraction,
  AdminTourPackage,
  AdminBooking,
  AdminAvailabilityEvent,
  AIWorkflowItem,
  AIApprovalItem,
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_DESTINATIONS,
  MOCK_ADMIN_ATTRACTIONS,
  MOCK_ADMIN_TOURS,
  MOCK_ADMIN_BOOKINGS,
  MOCK_ADMIN_AVAILABILITY,
  MOCK_ADMIN_AI_WORKFLOWS,
  MOCK_ADMIN_AI_APPROVALS,
} from '../mock/mockAdminData';

// Local transient state containers for fallback / offline preview
let usersState = [...MOCK_ADMIN_USERS];
let destinationsState = [...MOCK_ADMIN_DESTINATIONS];
let attractionsState = [...MOCK_ADMIN_ATTRACTIONS];
let toursState = [...MOCK_ADMIN_TOURS];
let bookingsState = [...MOCK_ADMIN_BOOKINGS];
let availabilityState = [...MOCK_ADMIN_AVAILABILITY];
let workflowsState = [...MOCK_ADMIN_AI_WORKFLOWS];
let approvalsState = [...MOCK_ADMIN_AI_APPROVALS];

export const adminService = {
  // Users
  getUsers: (): AdminUser[] => usersState,
  async fetchUsers(): Promise<AdminUser[]> {
    try {
      const res = await fetchApi<AdminUser[]>('/admin/users');
      if (Array.isArray(res.data) && res.data.length > 0) {
        usersState = res.data;
        return res.data;
      }
    } catch {
      // fallback
    }
    return usersState;
  },
  toggleUserStatus: (id: string): AdminUser[] => {
    usersState = usersState.map((u) =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    );
    return usersState;
  },

  // Destinations
  getDestinations: (): AdminDestination[] => destinationsState,
  async fetchDestinations(): Promise<AdminDestination[]> {
    try {
      const res = await fetchApi<any[]>('/destinations');
      if (Array.isArray(res.data) && res.data.length > 0) {
        destinationsState = res.data.map((d) => ({
          id: d.id,
          name: d.name,
          province: d.province || 'Central Province',
          category: d.category || 'Heritage',
          location: d.location || 'Sri Lanka',
          lat: d.latitude || 7.957,
          lng: d.longitude || 80.76,
          coverImage: d.imageUrl || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
          attractionsCount: d.attractionsCount || 0,
          status: d.status === 'Active' ? 'Active' : d.status === 'Draft' ? 'Draft' : 'Inactive',
          description: d.description || '',
          accessibility: 'Good',
          bestTimeToVisit: d.bestTimeToVisit || 'Year round',
          bookingsCount: d.activeTripsCount || 12,
          growthPercentage: 8.5,
        }));
        return destinationsState;
      }
    } catch {
      // fallback
    }
    return destinationsState;
  },
  addDestination: (dest: Omit<AdminDestination, 'id' | 'attractionsCount' | 'bookingsCount' | 'growthPercentage'>): AdminDestination => {
    const newDest: AdminDestination = {
      ...dest,
      id: `dest-${Date.now()}`,
      attractionsCount: 0,
      bookingsCount: 0,
      growthPercentage: 5.0,
    };
    destinationsState = [newDest, ...destinationsState];
    return newDest;
  },
  toggleDestinationStatus: (id: string): AdminDestination[] => {
    destinationsState = destinationsState.map((d) =>
      d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
    );
    return destinationsState;
  },

  // Attractions
  getAttractions: (): AdminAttraction[] => attractionsState,
  addAttraction: (attr: Omit<AdminAttraction, 'id'>): AdminAttraction => {
    const newAttr: AdminAttraction = {
      ...attr,
      id: `attr-${Date.now()}`,
    };
    attractionsState = [newAttr, ...attractionsState];
    return newAttr;
  },
  toggleAttractionStatus: (id: string): AdminAttraction[] => {
    attractionsState = attractionsState.map((a) =>
      a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a
    );
    return attractionsState;
  },

  // Tour Packages
  getTours: (): AdminTourPackage[] => toursState,
  async fetchTours(): Promise<AdminTourPackage[]> {
    try {
      const res = await fetchApi<any[]>('/tours');
      if (Array.isArray(res.data) && res.data.length > 0) {
        toursState = res.data.map((t) => ({
          id: t.id,
          name: t.title,
          destinationId: t.destinations?.[0]?.id || 'dest-01',
          destinationName: t.destinationName || 'Sri Lanka',
          duration: `${t.durationDays || 5} Days / ${Math.max(1, (t.durationDays || 5) - 1)} Nights`,
          daysCount: t.durationDays || 5,
          price: t.price || 500,
          capacity: t.maxGroupSize || 10,
          bookingsCount: 15,
          transportOption: 'Private Van',
          vehicleType: 'AC Luxury Van',
          status: t.status === 'Published' ? 'Active' : 'Draft',
          code: t.code || 'NV-01',
          title: t.title,
          durationDays: t.durationDays || 5,
          coverImage: t.imageUrl || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
          description: t.description || '',
          activities: ['Cultural Excursions', 'Guided Safari'],
          includesGuideBot: true,
        }));
        return toursState;
      }
    } catch {
      // fallback
    }
    return toursState;
  },
  addTour: (pkg: Omit<AdminTourPackage, 'id' | 'bookingsCount'>): AdminTourPackage => {
    const newPkg: AdminTourPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      bookingsCount: 0,
    };
    toursState = [newPkg, ...toursState];
    return newPkg;
  },
  toggleTourStatus: (id: string): AdminTourPackage[] => {
    toursState = toursState.map((t) =>
      t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t
    );
    return toursState;
  },

  // Bookings
  getBookings: (): AdminBooking[] => bookingsState,
  async fetchBookings(): Promise<AdminBooking[]> {
    try {
      const res = await fetchApi<AdminBooking[]>('/admin/bookings');
      if (Array.isArray(res.data) && res.data.length > 0) {
        bookingsState = res.data;
        return res.data;
      }
    } catch {
      // fallback
    }
    return bookingsState;
  },
  updateBookingStatus: (id: string, status: AdminBooking['status']): AdminBooking[] => {
    bookingsState = bookingsState.map((b) =>
      b.id === id ? { ...b, status } : b
    );
    return bookingsState;
  },

  // Availability
  getAvailability: (): AdminAvailabilityEvent[] => availabilityState,

  // AI Workflows
  getWorkflows: (): AIWorkflowItem[] => workflowsState,

  // AI Approvals
  getApprovals: (): AIApprovalItem[] => approvalsState,
  approveItinerary: (id: string): AIApprovalItem[] => {
    approvalsState = approvalsState.filter((a) => a.id !== id);
    return approvalsState;
  },
  rejectItinerary: (id: string): AIApprovalItem[] => {
    approvalsState = approvalsState.filter((a) => a.id !== id);
    return approvalsState;
  },

  // Overview KPIs
  getKPIs: () => ({
    totalUsers: usersState.length * 2080 + 12000,
    activeDestinations: destinationsState.filter((d) => d.status === 'Active').length,
    tourPackages: toursState.length * 40 + 116,
    totalBookings: 3842,
    pendingApprovals: approvalsState.length,
    activeWorkflows: workflowsState.filter((w) => w.status === 'Running' || w.status === 'Validation').length + 20,
    completedTrips: 2914,
  }),
  async fetchKPIs() {
    try {
      const res = await fetchApi<any>('/admin/statistics');
      if (res.data) {
        return {
          totalUsers: res.data.totalUsers,
          activeDestinations: res.data.activeDestinations,
          tourPackages: res.data.totalTours,
          totalBookings: res.data.totalBookings,
          pendingApprovals: approvalsState.length,
          activeWorkflows: workflowsState.filter((w) => w.status === 'Running' || w.status === 'Validation').length + 20,
          completedTrips: res.data.completedTrips,
        };
      }
    } catch {
      // fallback
    }
    return this.getKPIs();
  },
};
