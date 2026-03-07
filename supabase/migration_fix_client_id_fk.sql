-- Migration: Fix appointments.client_id FK
-- appointments.client_id doit référencer auth.users(id), pas public.clients(id)
-- À exécuter dans : Supabase Dashboard > SQL Editor

-- 1. Supprimer l'ancienne contrainte FK
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;

-- 2. Recréer la FK vers auth.users
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE SET NULL;
