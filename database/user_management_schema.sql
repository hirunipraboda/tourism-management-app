BEGIN;

-- ============================================================================
-- 1. USERS: Consolidate to clean snake_case, drop redundant and legacy columns
-- ============================================================================
-- Add profile_image if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image') THEN
        ALTER TABLE users ADD COLUMN profile_image text;
    END IF;
END $$;

-- Populate data from legacy columns
UPDATE users SET profile_image = COALESCE(profile_image, "profileImage") WHERE profile_image IS NULL AND "profileImage" IS NOT NULL;
UPDATE users SET status = CASE WHEN is_active = false THEN 'INACTIVE' ELSE 'ACTIVE' END WHERE status IS NULL OR status = '';
UPDATE users SET created_at = COALESCE(created_at, "createdAt"::timestamptz, NOW()) WHERE created_at IS NULL;
UPDATE users SET updated_at = COALESCE(updated_at, "updatedAt"::timestamptz, NOW()) WHERE updated_at IS NULL;

-- Drop legacy / duplicate columns from users
ALTER TABLE users
    DROP COLUMN IF EXISTS "password",
    DROP COLUMN IF EXISTS "is_active",
    DROP COLUMN IF EXISTS "bio",
    DROP COLUMN IF EXISTS "location",
    DROP COLUMN IF EXISTS "department",
    DROP COLUMN IF EXISTS "phone",
    DROP COLUMN IF EXISTS "profileImage",
    DROP COLUMN IF EXISTS "createdAt",
    DROP COLUMN IF EXISTS "updatedAt";

-- Ensure constraints on users
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;


-- ============================================================================
-- 2. TRIPS: Retain core trip attributes, drop redundant legacy columns
-- ============================================================================
-- Ensure data copied from legacy columns
UPDATE trips SET trip_name = COALESCE(trip_name, title) WHERE trip_name IS NULL OR trip_name = '';
UPDATE trips SET user_id = COALESCE(user_id, "userId") WHERE user_id IS NULL;
UPDATE trips SET start_date = COALESCE(start_date, "startDate"::timestamptz, NOW()) WHERE start_date IS NULL;
UPDATE trips SET end_date = COALESCE(end_date, "endDate"::timestamptz, NOW() + interval '5 days') WHERE end_date IS NULL;
UPDATE trips SET number_of_travelers = COALESCE(number_of_travelers, "numberOfTravelers", 1) WHERE number_of_travelers IS NULL;
UPDATE trips SET created_at = COALESCE(created_at, "createdAt"::timestamptz, NOW()) WHERE created_at IS NULL;
UPDATE trips SET updated_at = COALESCE(updated_at, "updatedAt"::timestamptz, NOW()) WHERE updated_at IS NULL;

-- If trip has destination_id, migrate to trip_destinations before dropping
INSERT INTO trip_destinations ("tripId", "destinationId")
SELECT id, destination_id FROM trips
WHERE destination_id IS NOT NULL AND destination_id <> ''
ON CONFLICT DO NOTHING;

-- Drop legacy foreign keys
ALTER TABLE trips DROP CONSTRAINT IF EXISTS "FK_trips_users_userId";
ALTER TABLE trips DROP CONSTRAINT IF EXISTS "trips_userId_fkey";

-- Drop legacy duplicate columns from trips
ALTER TABLE trips
    DROP COLUMN IF EXISTS "title",
    DROP COLUMN IF EXISTS "userId",
    DROP COLUMN IF EXISTS "startDate",
    DROP COLUMN IF EXISTS "endDate",
    DROP COLUMN IF EXISTS "numberOfTravelers",
    DROP COLUMN IF EXISTS "createdAt",
    DROP COLUMN IF EXISTS "updatedAt",
    DROP COLUMN IF EXISTS "description",
    DROP COLUMN IF EXISTS "aiScore",
    DROP COLUMN IF EXISTS "transportRequired",
    DROP COLUMN IF EXISTS "destination",
    DROP COLUMN IF EXISTS "destination_id";

-- Ensure user_id foreign key constraint
ALTER TABLE trips
    DROP CONSTRAINT IF EXISTS "FK_trips_users_user_id",
    ADD CONSTRAINT "FK_trips_users_user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


-- ============================================================================
-- 3. TRIP_DESTINATIONS: Standardize to snake_case and composite PK
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_destinations' AND column_name = 'tripId') THEN
        ALTER TABLE trip_destinations RENAME COLUMN "tripId" TO trip_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_destinations' AND column_name = 'destinationId') THEN
        ALTER TABLE trip_destinations RENAME COLUMN "destinationId" TO destination_id;
    END IF;
END $$;

-- Drop existing PK constraint and recreate composite primary key
ALTER TABLE trip_destinations DROP CONSTRAINT IF EXISTS "trip_destinations_pkey";
ALTER TABLE trip_destinations DROP CONSTRAINT IF EXISTS "PK_trip_destinations";
ALTER TABLE trip_destinations ADD CONSTRAINT "PK_trip_destinations" PRIMARY KEY (trip_id, destination_id);

-- Foreign keys
ALTER TABLE trip_destinations DROP CONSTRAINT IF EXISTS "trip_destinations_tripId_fkey";
ALTER TABLE trip_destinations DROP CONSTRAINT IF EXISTS "trip_destinations_destinationId_fkey";
ALTER TABLE trip_destinations DROP CONSTRAINT IF EXISTS "FK_trip_destinations_trips_trip_id";
ALTER TABLE trip_destinations DROP CONSTRAINT IF EXISTS "FK_trip_destinations_destinations_destination_id";

ALTER TABLE trip_destinations
    ADD CONSTRAINT "FK_trip_destinations_trips_trip_id" FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    ADD CONSTRAINT "FK_trip_destinations_destinations_destination_id" FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE;


-- ============================================================================
-- 4. ITINERARIES: Remove feasibility_score and drop legacy trip_itineraries
-- ============================================================================
ALTER TABLE itineraries DROP COLUMN IF EXISTS feasibility_score;

-- Drop obsolete competing trip_itineraries table
DROP TABLE IF EXISTS trip_itineraries CASCADE;


-- ============================================================================
-- 5. TRANSPORT_OPTIONS: Remove unused fields
-- ============================================================================
ALTER TABLE transport_options DROP CONSTRAINT IF EXISTS "FK_transport_options_itinerary_items_itinerary_item_id";
ALTER TABLE transport_options DROP CONSTRAINT IF EXISTS "transport_options_itinerary_item_id_fkey";

ALTER TABLE transport_options
    DROP COLUMN IF EXISTS itinerary_item_id,
    DROP COLUMN IF EXISTS intermediate_stops,
    DROP COLUMN IF EXISTS direction,
    DROP COLUMN IF EXISTS pickup_location,
    DROP COLUMN IF EXISTS dropoff_location,
    DROP COLUMN IF EXISTS source,
    DROP COLUMN IF EXISTS retrieved_at,
    DROP COLUMN IF EXISTS is_recommended;


-- ============================================================================
-- 6. TRANSPORT_PARTNERS: Standardize to snake_case, drop unused columns
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transport_partners' AND column_name = 'websiteUrl') THEN
        ALTER TABLE transport_partners RENAME COLUMN "websiteUrl" TO website_url;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transport_partners' AND column_name = 'discountDescription') THEN
        ALTER TABLE transport_partners RENAME COLUMN "discountDescription" TO discount_description;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transport_partners' AND column_name = 'isActive') THEN
        ALTER TABLE transport_partners RENAME COLUMN "isActive" TO is_active;
    END IF;
END $$;

ALTER TABLE transport_partners
    DROP COLUMN IF EXISTS "appUrl",
    DROP COLUMN IF EXISTS "createdAt",
    DROP COLUMN IF EXISTS "updatedAt";


-- ============================================================================
-- 7. DESTINATIONS: Standardize camelCase columns to snake_case
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'imageUrl') THEN
        ALTER TABLE destinations RENAME COLUMN "imageUrl" TO image_url;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'reviewCount') THEN
        ALTER TABLE destinations RENAME COLUMN "reviewCount" TO review_count;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'entryFee') THEN
        ALTER TABLE destinations RENAME COLUMN "entryFee" TO entry_fee;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'openingTime') THEN
        ALTER TABLE destinations RENAME COLUMN "openingTime" TO opening_time;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'closingTime') THEN
        ALTER TABLE destinations RENAME COLUMN "closingTime" TO closing_time;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'bestTimeToVisit') THEN
        ALTER TABLE destinations RENAME COLUMN "bestTimeToVisit" TO best_time_to_visit;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'isActive') THEN
        ALTER TABLE destinations RENAME COLUMN "isActive" TO is_active;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'createdAt') THEN
        ALTER TABLE destinations RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'updatedAt') THEN
        ALTER TABLE destinations RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

-- Convert province/category to text if enum
ALTER TABLE destinations ALTER COLUMN province TYPE text USING province::text;
ALTER TABLE destinations ALTER COLUMN category TYPE text USING category::text;
ALTER TABLE destinations ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamptz;
ALTER TABLE destinations ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at::timestamptz;
ALTER TABLE destinations ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE destinations ALTER COLUMN updated_at SET DEFAULT NOW();


-- ============================================================================
-- 8. ATTRACTIONS: Standardize to snake_case, drop duplicate pricePerPerson
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'destinationId') THEN
        ALTER TABLE attractions RENAME COLUMN "destinationId" TO destination_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'imageUrl') THEN
        ALTER TABLE attractions RENAME COLUMN "imageUrl" TO image_url;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'entryFee') THEN
        ALTER TABLE attractions RENAME COLUMN "entryFee" TO entry_fee;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'openingTime') THEN
        ALTER TABLE attractions RENAME COLUMN "openingTime" TO opening_time;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'closingTime') THEN
        ALTER TABLE attractions RENAME COLUMN "closingTime" TO closing_time;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'durationHours') THEN
        ALTER TABLE attractions RENAME COLUMN "durationHours" TO duration_hours;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'reviewsCount') THEN
        ALTER TABLE attractions RENAME COLUMN "reviewsCount" TO review_count;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'isActive') THEN
        ALTER TABLE attractions RENAME COLUMN "isActive" TO is_active;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'createdAt') THEN
        ALTER TABLE attractions RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attractions' AND column_name = 'updatedAt') THEN
        ALTER TABLE attractions RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

ALTER TABLE attractions
    DROP COLUMN IF EXISTS "pricePerPerson";

ALTER TABLE attractions ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamptz;
ALTER TABLE attractions ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at::timestamptz;


-- ============================================================================
-- 9. BOOKINGS: Drop legacy duplicate columns
-- ============================================================================
-- Drop foreign keys on legacy columns
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "FK_bookings_tours_tourId";
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "FK_bookings_users_userId";
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "FK_bookings_trips_tripId";
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "bookings_tourId_fkey";
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "bookings_userId_fkey";
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "bookings_tripId_fkey";

-- Copy data from legacy columns if necessary
UPDATE bookings SET user_id = COALESCE(user_id, "userId") WHERE user_id IS NULL AND "userId" IS NOT NULL;
UPDATE bookings SET trip_id = COALESCE(trip_id, "tripId") WHERE trip_id IS NULL AND "tripId" IS NOT NULL;
UPDATE bookings SET created_at = COALESCE(created_at, "createdAt"::timestamptz, NOW()) WHERE created_at IS NULL;
UPDATE bookings SET updated_at = COALESCE(updated_at, "updatedAt"::timestamptz, NOW()) WHERE updated_at IS NULL;

ALTER TABLE bookings
    DROP COLUMN IF EXISTS "tourId",
    DROP COLUMN IF EXISTS "userId",
    DROP COLUMN IF EXISTS "tripId",
    DROP COLUMN IF EXISTS "numberOfParticipants",
    DROP COLUMN IF EXISTS "startDate",
    DROP COLUMN IF EXISTS "endDate",
    DROP COLUMN IF EXISTS "travelOption",
    DROP COLUMN IF EXISTS "transportRequired",
    DROP COLUMN IF EXISTS "totalPrice",
    DROP COLUMN IF EXISTS "paymentStatus",
    DROP COLUMN IF EXISTS "createdAt",
    DROP COLUMN IF EXISTS "updatedAt";

-- Ensure user_id and trip_id foreign keys
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "FK_bookings_users_user_id";
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "FK_bookings_trips_trip_id";
ALTER TABLE bookings
    ADD CONSTRAINT "FK_bookings_users_user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT "FK_bookings_trips_trip_id" FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;


-- ============================================================================
-- 10. REVIEWS: Standardize to snake_case, drop tourId
-- ============================================================================
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "FK_reviews_tours_tourId";
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "reviews_tourId_fkey";

ALTER TABLE reviews DROP COLUMN IF EXISTS "tourId";

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'userId') THEN
        ALTER TABLE reviews RENAME COLUMN "userId" TO user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'destinationId') THEN
        ALTER TABLE reviews RENAME COLUMN "destinationId" TO destination_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'createdAt') THEN
        ALTER TABLE reviews RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'updatedAt') THEN
        ALTER TABLE reviews RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

ALTER TABLE reviews ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamptz;
ALTER TABLE reviews ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at::timestamptz;

-- Ensure foreign keys for reviews
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "reviews_userId_fkey";
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "reviews_destinationId_fkey";
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "FK_reviews_users_user_id";
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "FK_reviews_destinations_destination_id";

ALTER TABLE reviews
    ADD CONSTRAINT "FK_reviews_users_user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT "FK_reviews_destinations_destination_id" FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL;


-- ============================================================================
-- 11. DROP OBSOLETE TOURS TABLES AND PRISMA MIGRATIONS TABLE
-- ============================================================================
DROP TABLE IF EXISTS tour_destinations CASCADE;
DROP TABLE IF EXISTS tour_itineraries CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS _prisma_migrations CASCADE;

COMMIT;
