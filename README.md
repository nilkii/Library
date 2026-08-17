# 📚 Libraria

Libraria është një dyqan online librash, i zhvilluar si projekt semestral për lëndën
**Zhvillim i Ueb-it në Anën e Klientit** (Prof. Cand. Phd. Vesa Morina). Platforma lejon
përdoruesit të shfletojnë libra, të kërkojnë sipas titullit/autorit/zhanrit, të lënë
vlerësime, dhe të ruajnë librat e preferuar në një listë personale. Administratorët kanë
një panel të dedikuar për menaxhimin e plotë (CRUD) të katalogut të librave dhe shikimin e
mesazheve të kontaktit.

**🔗 Aplikacioni live:** _[shto këtu linkun e Vercel pas deployment-it]_

---

## Ekipi

| Anëtari | Roli |
| --- | --- |
| **Anila** | Full-stack development — autentifikimi & rolet (NextAuth), modelet & API routes, paneli i adminit, CRUD i librave/vlerësimeve, deployment & CI/CD |
| **Anesa** | Frontend & UI/UX — faqet statike (Home, About, Contact), faqja e Profilit, Dark/Light Mode, testimi i komponentëve |

---

## Teknologjitë e përdorura

- **Next.js 14** (Pages Router) + **TypeScript**
- **Tailwind CSS** — stilizim responsive, dark mode me `class` strategy
- **NextAuth.js** — autentifikim me Credentials + Google & Facebook OAuth, role-based middleware
- **MongoDB** + **Mongoose** — 4 modele: `User`, `Book`, `Review`, `ContactMessage`
- **react-hook-form** — validim formash
- **Context API** — dark/light mode global; **Custom Hooks** — `useDebounce`, `useFavorite`
- **Jest** + **React Testing Library** — teste për komponentë dhe API routes
- **GitHub Actions** — CI (lint, test, build) në çdo push/PR
- **Vercel** — hosting/deployment

## Funksionalitetet kryesore

- 11 faqe: Home, About, Contact, Login, Register, Dashboard, Admin Panel, Books (Products),
  Book Details (Product Details), Profile, Favorites — plus faqe 404 e personalizuar.
- 6 komponentë të ripërdorshëm: `Header`, `Footer`, `BookCard`, `Modal`, `Button`, `ReviewForm`.
- Autentifikim me NextAuth (Credentials, Google, Facebook) dhe menaxhim rolesh (`user` / `admin`)
  përmes `middleware.ts`.
- CRUD i plotë për **Books** (admin) dhe **Reviews** (përdoruesi mbi vlerësimin e vet).
- Data fetching me `getServerSideProps` (Dashboard, Profile, Favorites, Admin),
  `getStaticProps` + `revalidate` (Home, Books — ISR), dhe `getStaticPaths` + `getStaticProps`
  (Book Details — ISR).
- Formularë me validim (react-hook-form): Contact, Register, Login, Profile, Review.
- Dark/Light mode i funksional dhe i ruajtur në `localStorage`.
- CI/CD me GitHub Actions (lint + test + build në çdo push).

---

## Instalimi lokal

### 1. Kërkesat paraprake

- [Node.js](https://nodejs.org/) 20 ose më i ri
- Një llogari falas [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

### 2. Klono repository-n dhe instalo varësitë

```bash
git clone <url-i-repository-t>
cd libraria
npm install
```

### 3. Konfiguro variablat e ambientit

Kopjo `.env.local.example` në `.env.local`:

```bash
cp .env.local.example .env.local
```

Plotëso këto vlera në `.env.local`:

| Variabla | Përshkrimi |
| --- | --- |
| `MONGODB_URI` | Connection string nga MongoDB Atlas (shih hapat më poshtë) |
| `NEXTAUTH_SECRET` | Vlerë e rastësishme; gjenero me `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` në zhvillim |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Nga Google Cloud Console (opsionale por të kërkuara nga kërkesat) |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Nga Facebook for Developers (opsionale) |

#### a) Krijimi i një MongoDB Atlas cluster (falas)

1. Regjistrohu në [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Krijo një **Free Shared Cluster** (M0).
3. Te **Database Access**, krijo një përdorues (username + password).
4. Te **Network Access**, shto `0.0.0.0/0` (Allow access from anywhere) — mjafton për zhvillim/exam.
5. Te **Database → Connect → Drivers**, kopjo connection string-un dhe zëvendëso
   `<user>`, `<password>` dhe emrin e database-it (p.sh. `libraria`) — vendose në `MONGODB_URI`.

#### b) Krijimi i Google OAuth credentials

1. Shko te [Google Cloud Console](https://console.cloud.google.com/) → krijo një projekt të ri.
2. **APIs & Services → OAuth consent screen** → konfiguro (External, shto emailin tënd si test user).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → tipi "Web application".
4. Shto në **Authorized redirect URIs**:
   `http://localhost:3000/api/auth/callback/google`
5. Kopjo `Client ID` dhe `Client Secret` te `.env.local`.

#### c) Krijimi i Facebook OAuth credentials

1. Shko te [developers.facebook.com](https://developers.facebook.com/) → **My Apps → Create App**
   (tipi "Consumer").
2. Shto produktin **Facebook Login** dhe vendos:
   `http://localhost:3000/api/auth/callback/facebook` te "Valid OAuth Redirect URIs".
3. Kopjo `App ID` dhe `App Secret` te `.env.local` (`FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`).

> Nëse Google/Facebook nuk konfigurohen, aplikacioni funksionon normalisht me Credentials
> (email + fjalëkalim) — providers e OAuth thjesht nuk shfaqen si aktive.

### 4. Popullo databazën me të dhëna fillestare (opsionale por e rekomanduar)

```bash
npm run seed
```

Kjo krijon një përdorues admin (`admin@libraria.com` / `Admin123!` — ndryshoje pas hyrjes së parë,
ose vendos `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` në `.env.local` përpara se ta ekzekutosh)
dhe 8 libra shembull.

### 5. Nis serverin e zhvillimit

```bash
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000).

---

## Skripte të tjera

```bash
npm run build   # build për prodhim
npm run start   # nis build-in e prodhimit
npm run lint    # ESLint
npm test        # Jest — teste për komponentë dhe API routes
```

---

## Deployment në Vercel

1. Push-o repository-n në GitHub (manualisht, jashtë këtij mjedisi).
2. Në [vercel.com](https://vercel.com), importo repository-n.
3. Te **Settings → Environment Variables**, shto të njëjtat variabla si në `.env.local`
   (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — vendose si `https://<domain>.vercel.app`,
   `GOOGLE_CLIENT_ID/SECRET`, `FACEBOOK_CLIENT_ID/SECRET`).
4. Shto edhe redirect URI-t e reja (me domain-in e Vercel) te Google/Facebook OAuth apps.
5. Deploy. Vendos linkun final në krye të këtij README-je.

---

## CI/CD

Çdo `push`/`pull request` në branch-in `main` ekzekuton automatikisht (`.github/workflows/ci.yml`):
lint → teste → build (me një MongoDB service container për verifikimin e faqeve SSG/ISR).

---

## Struktura e projektit

```
pages/          # routes (Pages Router) + API routes
components/     # komponentë të ripërdorshëm
context/        # ThemeContext (dark/light mode)
hooks/          # useDebounce, useFavorite
lib/            # dbConnect, authOptions, apiAuth
models/         # skemat Mongoose: User, Book, Review, ContactMessage
middleware.ts   # mbrojtja e rrugëve sipas rolit
scripts/seed.ts # popullimi i databazës me të dhëna fillestare
__tests__/      # teste Jest (komponentë + API routes)
```

---

## Screenshots

_[Shto këtu screenshots të Home, Books, Book Details, Admin Panel, Dark Mode, etj. pas testimit lokal]_
