# 🚀 Quick Start Guide

## ⚡ Fastest Way to Run

### Windows

1. **Double-click file ini:**
   - `RUN_IN_CMD.bat`

Itu saja! Akan automatic:
- Install dependencies ✅
- Build aplikasi ✅
- Start server ✅
- Buka di http://localhost:3000

### Mac/Linux

```bash
npm install
npm run build
npm run start
```

Buka http://localhost:3000

---

## 📋 Manual Steps (jika perlu)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create .env.local
File sudah ada di root folder. Isinya:
```
BACKEND_TYPE=supabase
NEXT_PUBLIC_BACKEND_TYPE=supabase
ADMIN_TOKEN=admin-token-skm-questionnaire-default-12345678
```

(Atau custom sesuai backend pilihan Anda)

### Step 3: Build
```bash
npm run build
```

### Step 4: Start Server
```bash
npm run start
```

---

## 🌐 Access Application

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Form | http://localhost:3000/form |
| Dashboard | http://localhost:3000/dashboard |

---

## 🔑 Admin Token

Token untuk dashboard sudah set default:
```
admin-token-skm-questionnaire-default-12345678
```

Jika ingin custom, edit `.env.local`:
```env
ADMIN_TOKEN=your-custom-token-min-32-chars
```

---

## ✅ Test Application

1. **Form Page:**
   - Buka http://localhost:3000/form
   - Isi semua 8 pertanyaan (rating 1-5)
   - Click "Kirim Respons"
   - Seharusnya success ✓

2. **Dashboard:**
   - Buka http://localhost:3000/dashboard
   - Masukkan token: `admin-token-skm-questionnaire-default-12345678`
   - Click "Login"
   - Seharusnya muncul analytics ✓

---

## 🐛 Troubleshooting

### "npm is not recognized"
- Pastikan Node.js sudah install: https://nodejs.org
- Restart terminal setelah install

### Port 3000 sudah digunakan
- Buka port 3001: `PORT=3001 npm run start`
- Atau kill process di port 3000

### "Cannot find module"
```bash
rm -r node_modules
npm install
npm run build
npm run start
```

### Blank page atau error di browser
- Buka DevTools (F12)
- Check Console tab untuk error
- Verify `.env.local` setting

---

## 🚀 Deploy ke Production

Setelah test local berhasil:

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

---

## 📚 Documentation

- `PROJECT_SUMMARY.md` - Project overview
- `DEPLOYMENT_COMPLETE.md` - Production deployment
- `RUN_LOCALLY.md` - Detailed local setup

---

**Ready! 🎉**

Jalankan `RUN_IN_CMD.bat` (Windows) atau command di atas (Mac/Linux).
