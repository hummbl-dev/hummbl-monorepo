# HUMMBL

**120 Mental Models for Strategic Thinking**

A modern web application for exploring and searching the HUMMBL (Highly Useful Mental Model Base Language) framework - a comprehensive collection of mental models organized into six core transformations.

🌐 **Live Site:** [hummbl.io](https://hummbl.io)

---

## 📚 Documentation

For detailed development setup and guidelines, see the [Development Guide](docs/DEVELOPMENT.md).

## 🎯 Overview

HUMMBL provides an interactive interface to browse, search, and learn about 120 mental models that enhance strategic thinking and decision-making. Each model includes:

- **Code**: Unique identifier for quick reference (e.g., P1, IN5, CO12)
- **Name**: The mental model's title
- **Definition**: Clear explanation of the concept
- **Example**: Practical application scenario
- **Transformation**: Classification into one of six cognitive transformations

---

## 🧠 Six Transformations

The mental models are organized into six fundamental transformations:

| Code   | Transformation | Description                                |
| ------ | -------------- | ------------------------------------------ |
| **P**  | Perspective    | Viewing situations from different angles   |
| **IN** | Inversion      | Thinking backwards or opposite             |
| **CO** | Composition    | Combining elements together                |
| **DE** | Decomposition  | Breaking down into parts                   |
| **RE** | Recursion      | Self-referential patterns and iteration    |
| **SY** | Meta-Systems   | Systems thinking and higher-order patterns |

Each transformation contains 20 models (P1-P20, IN1-IN20, etc.)

---

## ✨ Features

- **🔍 Search**: Find models by name, code, or keywords in definitions
- **🎯 Filter**: Browse by transformation type (P, IN, CO, DE, RE, SY)
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Fast**: Built with Vite for instant loading and smooth interactions
- **🎨 Clean UI**: Card-based grid with expandable detail views

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- pnpm 8.x or later
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/hummbl-io.git
   cd hummbl-io
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

Start the development server:

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
pnpm preview
```

### Testing

Run unit tests:

```bash
pnpm test
```

Run performance tests:

```bash
pnpm test:perf
pnpm test:auth
```

### Linting and Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Check TypeScript types
pnpm typecheck
```

### Git Hooks

This project uses Husky for Git hooks. After cloning, run:

```bash
pnpm prepare
```

This will set up pre-commit hooks that run linting and formatting automatically.

## 📊 Analytics

The application includes a robust analytics system that tracks user interactions while respecting privacy. The system supports multiple analytics providers and is designed to be performant and reliable.

### Key Features

- **Multi-provider Support**: Tracks events in both Plausible and Google Analytics
- **Type Safety**: Full TypeScript support with strict type checking
- **Performance Optimized**: Lightweight and non-blocking
- **Comprehensive Testing**: Extensive test coverage for all tracking functions
- **Privacy-Focused**: No personally identifiable information (PII) is collected by default

### Available Tracking Methods

```typescript
// Basic event tracking
trackEvent({
  event: 'button_click',
  category: 'engagement',
  label: 'Signup Button',
  properties: {
    button_position: 'hero',
    button_color: 'blue',
  },
});

// Page view tracking
trackPageView('/dashboard', 'Dashboard Page');

// Predefined events
trackSearchPerformed('mental models', 15);
trackMentalModelViewed('P1', 'First Principles');
```

### Configuration

Initialize analytics in your main application file:

```typescript
import { initAnalytics } from './utils/analytics';

initAnalytics({
  debug: process.env.NODE_ENV === 'development',
  trackPageViews: true,
  trackErrors: true,
  sampleRate: 1.0, // 100% of sessions
});
```

### Testing

Run the test suite:

```bash
# Run all analytics tests
pnpm test:analytics

# Run edge case tests
pnpm test:analytics:edge-cases
```

For more details, see the [Analytics Documentation](./docs/ANALYTICS.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/[YOUR-USERNAME]/hummbl-io.git
   cd hummbl-io
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

---

## 📦 Build & Deployment

### Local Production Build

To create an optimized production build:

```bash
npm run build
```

The build artifacts will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

### Deploy to Vercel

This project is configured for Vercel deployment:

1. **Connect to Vercel:**
   - Push your repository to GitHub
   - Import project in [Vercel Dashboard](https://vercel.com/new)
   - Vercel auto-detects Vite configuration

2. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Add Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your domain (e.g., `hummbl.io`)
   - Update DNS records as shown by Vercel

### Deploy to Other Platforms

**Cloudflare Pages:**

```bash
npm run build
npx wrangler pages deploy dist --project-name=hummbl-io
```

**Netlify:**

```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety and developer experience
- **Vite** - Next-generation build tool with HMR
- **CSS3** - Custom styling (no framework needed)

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## 📁 Project Structure

```
hummbl-io/
├── public/
│   └── models.json          # All 120 mental models (data source)
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Component styles
│   ├── index.css            # Global styles
│   └── main.tsx             # Application entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── vercel.json              # Deployment configuration
```

---

## 🎨 Usage

### Searching Models

Use the search bar to find models by:

- **Model name** (e.g., "First Principles")
- **Model code** (e.g., "P1")
- **Keywords** in definitions (e.g., "feedback", "decomposition")

The search is case-insensitive and searches across all model fields.

### Filtering by Transformation

Click transformation filter buttons to view models by type:

- **All** - View all 120 models
- **P - Perspective** - Models focused on viewpoint shifts
- **IN - Inversion** - Models using reverse thinking
- **CO - Composition** - Models about combining elements
- **DE - Decomposition** - Models about breaking down complexity
- **RE - Recursion** - Models with self-referential patterns
- **SY - Meta-Systems** - Models for systems-level thinking

### Viewing Model Details

Click any model card to expand and view:

- Complete definition
- Practical example application
- Transformation classification
- Tier level (1-20)

Click outside or on another card to close the detail view.

---

## 🔧 Customization

### Adding or Modifying Models

Models are stored in `public/models.json`. Each model follows this structure:

```json
{
  "code": "P1",
  "name": "First Principles Framing",
  "transformation": "P",
  "tier": 1,
  "definition": "Reduce complex problems to foundational truths...",
  "example": "When redesigning pricing strategy, start with unit costs..."
}
```

After modifying `models.json`, restart the development server.

### Styling

- **Global styles:** `src/index.css`
- **Component styles:** `src/App.css`
- **Colors, spacing, typography** can be customized in CSS files

---

## 🐛 Troubleshooting

### Build Issues

**Error: "Command 'vite build' exited with 127"**

- **Solution:** Ensure build command in deployment platform is set to `npm run build`, not `vite build`

**Error: "Module not found"**

- **Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install`

**TypeScript errors during build**

- **Solution:** Run `npm run build` locally first to catch type errors
- Check `tsconfig.json` configuration

### Development Server Issues

**Port 5173 already in use**

- **Solution:** Kill the existing process or change port in `vite.config.ts`:
  ```ts
  export default defineConfig({
    plugins: [react()],
    server: { port: 3000 },
  });
  ```

**Hot reload not working**

- **Solution:** Check browser console for errors
- Restart dev server with `npm run dev`

---

## 📚 About HUMMBL Framework

The HUMMBL Mental Models Framework is a comprehensive collection of 120 cognitive tools for strategic thinking, organized into six transformations with 20 tiers each.

**Framework Structure:**

- **Base6**: 6 foundational models (one per transformation)
- **Base42**: 42 core models (first 7 tiers)
- **Base90**: 90 essential models (first 15 tiers)
- **Base120**: Complete collection (all 20 tiers)

For more information about the framework itself, visit the documentation (coming soon).

---

## 🤝 Contributing

Contributions are welcome! Areas for contribution:

- **Bug reports** - Found an issue? Open a GitHub issue
- **Feature requests** - Have an idea? Suggest it via issues
- **Model improvements** - Suggest edits to definitions or examples
- **UI/UX enhancements** - Improve the interface
- **Documentation** - Help improve this README or add guides

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally (`npm run dev` and `npm run build`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🌟 Acknowledgments

- **HUMMBL Framework** - Original mental models framework
- **React Team** - For the excellent UI library
- **Vite Team** - For the blazing-fast build tool
- **Vercel** - For seamless deployment platform

---

## 📧 Contact

**Website:** [hummbl.io](https://hummbl.io)

For questions, feedback, or bug reports:

- Open an issue on GitHub
- Visit the live site for more information

---

**HUMMBL Mental Models Framework v1.0** - Base120 Complete Collection

---

🚀 **CI/CD Status:** Automated testing and deployment enabled via GitHub Actions

<!-- Deployment test 2025-10-22 -->
