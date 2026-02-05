# HUMMBL Framework - React Integration Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/others/CascadeProjects/hummbl-io
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
VITE_API_BASE_URL=/api
VITE_BUILD_OUTPUT_DIR=/data
VITE_USE_STATIC_DATA=true
VITE_ENABLE_CACHING=true
VITE_CACHE_TTL=300000
```

### 3. Copy Build Outputs

```bash
# Create public data directory
mkdir -p public/data

# Copy build outputs from parallel build
cp /Users/others/Downloads/narratives.yaml public/data/narratives.json
cp /Users/others/Downloads/narrative_links.json public/data/network.json
cp /Users/others/Downloads/dist/qdm/*.json public/data/
cp /Users/others/Downloads/dist/ledger/*.json public/data/
cp /Users/others/Downloads/dist/sitrep/*.json public/data/
```

### 4. Run Development Server

```bash
npm run dev
```

---

## 📁 Project Structure

```
hummbl-io/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts
│   │   └── narratives.ts
│   ├── components/       # React components
│   │   └── narratives/
│   │       ├── NarrativeCard.tsx
│   │       └── NarrativeList.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useNarratives.ts
│   │   └── useNetwork.ts
│   ├── types/            # TypeScript definitions
│   │   ├── narrative.ts
│   │   └── network.ts
│   ├── utils/            # Utility functions
│   │   └── dataLoader.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── data/             # Static build outputs
│       ├── narratives.json
│       ├── network.json
│       ├── qdm.json
│       ├── ledger.json
│       └── sitrep.json
├── API_INTEGRATION_SPEC.md
└── package.json
```

---

## 🔌 Using Components

### NarrativeList

```tsx
import { NarrativeList } from './components/narratives/NarrativeList';

function App() {
  return <NarrativeList />;
}
```

### Custom Hook Usage

```tsx
import { useNarratives } from './hooks/useNarratives';

function MyComponent() {
  const { narratives, loading, error, refetch } = useNarratives();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {narratives.map((n) => (
        <div key={n.narrative_id}>{n.title}</div>
      ))}
    </div>
  );
}
```

---

## 🎯 Integration Modes

### Mode 1: Static Data (Recommended for Development)

- Uses pre-built JSON files from `public/data/`
- No API server required
- Fast and reliable
- Set `VITE_USE_STATIC_DATA=true`

### Mode 2: API Endpoints (Production)

- Fetches data from API server
- Dynamic updates
- Requires backend implementation
- Set `VITE_USE_STATIC_DATA=false`

---

## 📊 Data Flow

```
Parallel Build Pipeline
        ↓
  Build Outputs (JSON)
        ↓
  public/data/ (Static)
        ↓
  dataLoader.ts (Bridge)
        ↓
  React Hooks (useNarratives, etc.)
        ↓
  React Components (NarrativeList, etc.)
        ↓
  User Interface
```

---

## ✅ Created Files

- ✅ `src/types/narrative.ts` - TypeScript types
- ✅ `src/types/network.ts` - Network types
- ✅ `src/api/client.ts` - API client with caching
- ✅ `src/api/narratives.ts` - Narrative endpoints
- ✅ `src/hooks/useNarratives.ts` - Narratives hook
- ✅ `src/hooks/useNetwork.ts` - Network hook
- ✅ `src/components/narratives/NarrativeCard.tsx` - Card component
- ✅ `src/components/narratives/NarrativeList.tsx` - List component
- ✅ `src/utils/dataLoader.ts` - Data bridge utility
- ✅ `API_INTEGRATION_SPEC.md` - Full specification

---

## 🚦 Next Steps

1. **Test Static Data Mode**

   ```bash
   npm run dev
   # Visit http://localhost:5173
   ```

2. **Add More Components**
   - NetworkVisualizer (D3.js integration)
   - QDMDashboard
   - LedgerViewer
   - SITREPPanel

3. **Implement Routing**

   ```bash
   npm install react-router-dom
   ```

4. **Add Styling**
   - TailwindCSS (recommended)
   - Or custom CSS

5. **Deploy to Vercel**
   ```bash
   npm run build
   vercel deploy
   ```

---

## 🔧 Troubleshooting

### Data Not Loading

- Check `public/data/` directory exists
- Verify JSON files are valid
- Check browser console for errors

### TypeScript Errors

- Run `npm install` to ensure types are installed
- Check `tsconfig.json` configuration

### Build Errors

- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `npm install`

---

**Status**: ✅ Integration Layer Complete  
**Ready for**: Component Development & Testing
