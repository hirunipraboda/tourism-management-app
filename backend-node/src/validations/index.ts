import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['USER', 'ADMIN']).optional(),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createDestinationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.string().min(2, 'Location is required'),
    province: z.enum([
      'CENTRAL', 'SOUTHERN', 'WESTERN', 'NORTHERN', 'EASTERN',
      'NORTH_CENTRAL', 'NORTH_WESTERN', 'SABARAGAMUWA', 'UVA'
    ]).optional(),
    district: z.string().optional(),
    imageUrl: z.string().url('Must be a valid image URL').optional().default('https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80'),
    category: z.enum([
      'BEACH', 'WILDLIFE', 'HERITAGE', 'ADVENTURE', 'NATURE',
      'CULTURE', 'RELIGIOUS', 'HILL_COUNTRY', 'CITY'
    ]).optional(),
    entryFee: z.number().min(0).optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
  }),
});

export const createAttractionSchema = z.object({
  body: z.object({
    destinationId: z.string().uuid('Invalid destination ID').optional(),
    name: z.string().min(2, 'Name is required'),
    description: z.string().min(5, 'Description is required'),
    imageUrl: z.string().optional(),
    category: z.string().optional(),
    entryFee: z.number().min(0).optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    durationHours: z.number().optional(),
    pricePerPerson: z.number().optional(),
  }),
});

export const createTourSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    slug: z.string().optional(),
    code: z.string().optional(),
    description: z.string().min(10, 'Description is required'),
    durationDays: z.number().min(1, 'Duration must be at least 1 day'),
    price: z.number().min(0, 'Price must be non-negative'),
    currency: z.string().optional().default('USD'),
    imageUrl: z.string().optional(),
    maxGroupSize: z.number().min(1).optional().default(10),
    category: z.enum(['CULTURAL', 'WILDLIFE', 'ADVENTURE', 'HERITAGE', 'BEACH', 'NATURE', 'HILL_COUNTRY']).optional(),
    destinationIds: z.array(z.string()).optional(),
  }),
});

export const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().optional(),
    startDate: z.string().datetime().or(z.string().min(5)),
    endDate: z.string().datetime().or(z.string().min(5)),
    numberOfTravelers: z.number().min(1).optional().default(1),
    budget: z.number().min(0).optional().default(0),
    transportRequired: z.boolean().optional().default(false),
    destinationIds: z.array(z.string()).optional(),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    tourId: z.string().optional(),
    tripId: z.string().optional(),
    customerName: z.string().min(2, 'Customer name is required'),
    customerEmail: z.string().email('Invalid customer email'),
    numberOfParticipants: z.number().min(1, 'At least 1 participant required'),
    startDate: z.string().min(5, 'Start date is required'),
    endDate: z.string().optional(),
    travelOption: z.enum(['PUBLIC', 'PRIVATE', 'NONE']).optional().default('NONE'),
    transportRequired: z.boolean().optional().default(false),
    totalPrice: z.number().min(0, 'Total price is required'),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    destinationId: z.string().optional(),
    tourId: z.string().optional(),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().min(3, 'Comment must be at least 3 characters'),
  }),
});
