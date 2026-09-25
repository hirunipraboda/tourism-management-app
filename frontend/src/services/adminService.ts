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

// Local transient state containers
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
  toggleUserStatus: (id: string): AdminUser[] => {
    usersState = usersState.map((u) =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    );
    return usersState;
  },

  // Destinations
  getDestinations: (): AdminDestination[] => destinationsState,
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
};
