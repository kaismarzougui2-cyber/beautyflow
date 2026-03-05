# BeautyFlow / BarberFlow — Price Killer Booking App

## Vision du Projet

Alternative "Price Killer" à Planity et Treatwell pour :
- **BeautyFlow** : indépendantes (beauté féminine)
- **BarberFlow** : barbiers (beauté masculine)

Un seul codebase, deux thèmes visuels distincts.

**Modèle économique :** 20 €/mois (abonnement) + 1 % commission sur acomptes Stripe.

---

## Stack Technique

- **Framework :** Next.js 14+ (App Router)
- **Style :** Tailwind CSS + Framer Motion (animations)
- **Composants :** shadcn/ui + Lucide React (icônes)
- **Base de données & Auth :** Supabase
- **Paiement :** Stripe
- **Emails :** Resend
- **Carte :** OpenStreetMap / Leaflet

---

## Design System & Themes

### BeautyFlow (Feminin)
| Token | Valeur |
|-------|--------|
| Background | `#FDF2F8` (Rose très clair) |
| Accent | `#DB2777` (Rose vif) |
| Text | `#9D174D` |
| Vibe | Arrondie, douce, premium |

### BarberFlow (Masculin)
| Token | Valeur |
|-------|--------|
| Background | `#0F172A` (Bleu nuit / Noir) |
| Accent | `#F59E0B` (Or / Ambre) |
| Text | `#FFFFFF` |
| Vibe | Anguleuse, sombre, "Street-Luxe" |

Le thème est choisi lors de l'onboarding et stocké dans `profiles.theme`.

---

## Logique Metier & Tarification

| Offre | Prix |
|-------|------|
| Standard | 20 €/mois |
| Affiliation (code promo) | 15 € le 1er mois, puis 20 €/mois |
| Early Bird (code `VIP10`) | 10 €/mois à vie |

**Affiliation :** l'apporteur gagne 5 €/mois pendant 12 mois par filleul actif.

---

## Structure de l'App

### Portail Client (Public)
- Landing page avec recherche par ville
- Carte interactive (OpenStreetMap / Leaflet)
- Pas d'authentification obligatoire pour consulter

### Onboarding Pro (5 étapes)
1. Identité (nom, prénom, salon)
2. Thème (BeautyFlow ou BarberFlow)
3. Horaires (jours et créneaux d'ouverture)
4. Code promo (affiliation / early bird)
5. Paiement (Stripe)

### Dashboard Pro
- **Agenda :** vue mois / semaine avec navigation longue durée
- **Prestations :** catégories sélectionnables (pas de texte libre)
- **RDV manuels :** ajout manuel pour bloquer le calendrier
- **Affiliation :** suivi des gains et code de parrainage personnel

---

## Schema Base de Donnees (Supabase SQL)

```sql
-- Profils utilisateurs / pros
profiles (
  id          uuid primary key references auth.users,
  full_name   text,
  role        text,          -- 'pro' | 'client'
  theme       text,          -- 'beauty' | 'barber'
  city        text,
  coordinates point          -- longitude, latitude
)

-- Prestations proposées par un pro
services (
  id          uuid primary key,
  provider_id uuid references profiles(id),
  name        text,
  duration    integer,       -- en minutes
  price       numeric,
  category    text
)

-- Rendez-vous
appointments (
  id          uuid primary key,
  client_info jsonb,         -- nom, email, téléphone
  service_id  uuid references services(id),
  start_time  timestamptz,
  is_manual   boolean default false
)
```

---

## Conventions de Developpement

- Les routes App Router suivent la structure `app/(public)/...` et `app/(dashboard)/...`
- Le thème actif est résolu côté serveur via `profiles.theme` et injecté comme classe CSS (`theme-beauty` ou `theme-barber`)
- Les variables CSS de couleur sont définies dans `globals.css` et surchargées par thème
- Les composants communs sont dans `components/ui/` (shadcn), les composants métier dans `components/`
- Stripe webhooks gérés dans `app/api/webhooks/stripe/route.ts`
- Emails transactionnels via Resend dans `app/api/emails/`

---

## Cles d'Environnement Necessaires

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```
