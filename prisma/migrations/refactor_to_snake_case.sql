-- 1. CLEANUP
DROP TABLE IF EXISTS public.activity_spaces cascade;
DROP TABLE IF EXISTS public.bookings cascade;
DROP TABLE IF EXISTS public.products cascade;
DROP TABLE IF EXISTS public.activities cascade;
DROP TABLE IF EXISTS public.contacts cascade;
DROP TABLE IF EXISTS public.spaces cascade;
DROP TABLE IF EXISTS public.ventures cascade;

-- 2. CREATE NEW TABLES (snake_case)

CREATE TABLE public.spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER, -- Added
    dimensions TEXT,
    type TEXT NOT NULL,
    hourly_rate NUMERIC NOT NULL,
    color TEXT,
    image TEXT, -- Added
    map_config JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    activity_type TEXT, -- Added
    status TEXT NOT NULL DEFAULT 'pending',
    noise_level TEXT NOT NULL DEFAULT 'moderate',
    needs_silence BOOLEAN NOT NULL DEFAULT FALSE,
    exclusive BOOLEAN NOT NULL DEFAULT FALSE,
    admin_notes TEXT, -- Added
    total_price NUMERIC, -- Added
    recurrence JSONB,
    user_id UUID,
    contact_id UUID REFERENCES public.contacts(id),
    space_id UUID NOT NULL REFERENCES public.spaces(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    responsible TEXT,
    image_url TEXT,
    video_url TEXT,
    instagram_handle TEXT,
    email TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.activity_spaces (
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    PRIMARY KEY (activity_id, space_id)
);

CREATE TABLE public.ventures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner TEXT,
    description TEXT,
    logo_url TEXT,
    owner_image_url TEXT,
    whatsapp TEXT,
    instagram TEXT,
    facebook TEXT,
    website TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    currency TEXT NOT NULL DEFAULT 'CRC',
    category TEXT,
    type TEXT NOT NULL DEFAULT 'product',
    size TEXT,
    dimensions TEXT,
    image_url TEXT,
    video_url TEXT,
    venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_spaces BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_contacts BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_activities BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_ventures BEFORE UPDATE ON public.ventures FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. DATA MIGRATION

-- Spaces
INSERT INTO public.spaces (id, slug, name, description, capacity, dimensions, type, hourly_rate, color, image, map_config, created_at, updated_at)
SELECT
    id::UUID, slug, name, description, NULL, dimensions, type, "hourlyRate", color, NULL,
    COALESCE("mapConfig"::JSONB, '{}'::JSONB), "createdAt", "updatedAt"
FROM public."Space";

-- Contacts
INSERT INTO public.contacts (id, name, email, phone, metadata, created_at, updated_at)
SELECT id::UUID, name, email, phone, COALESCE(metadata, '{}'::JSONB), "createdAt", "updatedAt"
FROM public."Contact";

-- Bookings
INSERT INTO public.bookings (id, title, description, start_time, end_time, activity_type, status, noise_level, needs_silence, exclusive, admin_notes, total_price, recurrence, user_id, contact_id, space_id, created_at, updated_at)
SELECT
    b.id::UUID, b.title, b.description, b."startTime", b."endTime", NULL, b.status, b."noiseLevel", b."needsSilence", b.exclusive, NULL, NULL, COALESCE(b.recurrence::JSONB, NULL),
    CASE WHEN b."userId" ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN b."userId"::UUID ELSE NULL END,
    b."contactId"::UUID, s.id, b."createdAt", b."updatedAt"
FROM public."Booking" b
JOIN public.spaces s ON b."spaceId" = s.slug;

-- Activities
INSERT INTO public.activities (id, title, description, start_date, end_date, start_time, responsible, image_url, video_url, instagram_handle, email, tags, created_at, updated_at)
SELECT
    id::UUID, title, description, "startDate"::DATE, "endDate"::DATE,
    CASE WHEN "startTime" ~ '^[0-9]{2}:[0-9]{2}' THEN "startTime"::TIME ELSE NULL END,
    responsible, "imageUrl", "videoUrl", instagram, email,
    CASE WHEN tags IS NOT NULL AND tags <> '' THEN string_to_array(tags, ',') ELSE NULL END,
    "createdAt", "updatedAt"
FROM public."Activity";

-- Activity Spaces
INSERT INTO public.activity_spaces (activity_id, space_id)
SELECT "ActivityId"::UUID, s.id
FROM public."ActivitySpaces" asp
JOIN public.spaces s ON asp."SpaceId" = s.slug;

-- Ventures
INSERT INTO public.ventures (id, name, owner, description, logo_url, owner_image_url, whatsapp, instagram, facebook, website, email, created_at, updated_at)
SELECT id::UUID, name, owner, description, "logoUrl", "ownerImageUrl", whatsapp, instagram, facebook, website, email, "createdAt", NOW()
FROM public."Venture";

-- Products
INSERT INTO public.products (id, name, description, price, currency, category, type, size, dimensions, image_url, video_url, venture_id, created_at, updated_at)
SELECT id::UUID, name, description, price, currency, category, type, size, dimensions, "imageUrl", "videoUrl", "ventureId"::UUID, "createdAt", NOW()
FROM public."Product";
