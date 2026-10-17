# SKM Questionnaire Website

Aplikasi Survei Kepuasan Masyarakat (SKM) yang responsif dengan dukungan backend ganda (Google Sheets dan Supabase).

## 📋 Fitur Utama

- ✅ **Form Survei Responsif** - 8 pertanyaan inti + data demografis
- ✅ **Dashboard Analytics** - Visualisasi kepuasan dan tren
- ✅ **Dual Backend** - Google Sheets dan Supabase
- ✅ **Export Data** - CSV dan Excel
- ✅ **Admin Auth** - Perlindungan endpoint
- ✅ **Mobile-First** - Design responsif Tailwind CSS

## 🚀 Memulai

### Persyaratan
- Node.js 18+
- npm atau yarn

### Instalasi

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000

## 🔧 Konfigurasi

**Google Sheets:**
```env
BACKEND_TYPE=google-sheets
GOOGLE_APPS_SCRIPT_URL=https://...
GOOGLE_SHEET_ID=...
ADMIN_TOKEN=token-min-32-chars
```

**Supabase:**
```env
BACKEND_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
ADMIN_TOKEN=token-min-32-chars
```

## 📁 Struktur

```
src/
├── app/                 # Pages (form, dashboard)
├── lib/
│   ├── backend/        # Backend abstraction
│   └── types/          # Type definitions
└── public/             # Static assets
```

## 🧪 Testing

```bash
npm run test
npm run test:run
npm run test:ui
```

## 🏗️ Build & Deploy

```bash
npm run build
npm run start
```

### Vercel
```bash
vercel
```

### Netlify
```bash
netlify deploy
```

## 📊 API Endpoints

- `POST /api/submit` - Submit survei
- `GET /api/analytics?token=...` - Get analytics
- `GET /api/export?format=csv&token=...` - Export data

## 📖 Documentation

- [Backend Contract](./src/lib/backend/BACKEND_CONTRACT.md)
- [Google Apps Script](./docs/GOOGLE_APPS_SCRIPT_SETUP.md)
- [Supabase Setup](./docs/GOOGLE_SHEETS_SETUP.md)

## ✅ Task Status

Progress: 15+/41 tasks completed

- ✅ Setup & Infrastructure
- ✅ Backend Abstraction
- ✅ Google Sheets Backend
- ✅ Supabase Backend
- ✅ Frontend Form & Dashboard
- ⏳ Testing & Deployment

## 📄 License

MIT

Dibuat dengan ❤️ untuk meningkatkan kepuasan masyarakat.
