# Personal Portfolio Website

A modern, responsive portfolio website built with React, Vite, Tailwind CSS, and Framer Motion. Features smooth animations, dark/light mode toggle, and a clean, professional design.

## ✨ Features

- **Modern Design**: Clean, professional layout with custom color palette
- **Responsive**: Mobile-first design that works on all devices
- **Smooth Animations**: Powered by Framer Motion for engaging interactions
- **Dark/Light Mode**: Toggle between themes with persistent storage
- **Loading Screen**: Beautiful animated loading experience
- **Smooth Scrolling**: Navigation with active section highlighting
- **Contact Form**: Functional contact form with validation
- **Project Showcase**: Featured and other projects with hover effects
- **Music Section**: Placeholder for audio content and track listings
- **Social Links**: Easy integration with social media platforms

## 🎨 Design System

### Color Palette
- **Primary**: White (background/content areas)
- **Accent Blue**: Royal/Sky Blue (#2563eb, #0ea5e9) for buttons and links
- **Accent Gold**: Gold (#f59e0b) for subtle highlights
- **Contrast**: Black (#000000) for text and borders

### Typography
- **Display Font**: Poppins for headings
- **Body Font**: Inter for body text
- **Fallback**: Montserrat and system fonts

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
portfolio/
├── public/
├── src/
│   ├── components/
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Hero.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── Music.jsx
│   │   ├── Navbar.jsx
│   │   ├── Projects.jsx
│   │   ├── ScrollToTop.jsx
│   │   └── ThemeToggle.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 🎯 Customization Guide

### 1. Personal Information
Update the following files with your information:

- **Hero Section** (`src/components/Hero.jsx`): Change "Your Name" and tagline
- **About Section** (`src/components/About.jsx`): Update bio, skills, and experience
- **Contact Section** (`src/components/Contact.jsx`): Update email, location, and social links

### 2. Projects
Edit the projects array in `src/components/Projects.jsx`:

```javascript
const projects = [
  {
    id: 1,
    title: "Your Project Name",
    description: "Project description...",
    image: "🛒", // Emoji or image URL
    technologies: ["React", "Node.js", "MongoDB"],
    liveUrl: "https://your-project.com",
    githubUrl: "https://github.com/yourusername/project",
    featured: true
  }
]
```

### 3. Music Section
Update the tracks array in `src/components/Music.jsx`:

```javascript
const tracks = [
  {
    id: 1,
    title: "Your Track Name",
    artist: "Your Name",
    duration: "3:45",
    genre: "Electronic",
    platform: "Spotify",
    url: "https://spotify.com/track/...",
    featured: true
  }
]
```

### 4. Social Links
Update social media links in `src/components/Contact.jsx`:

```javascript
const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: '🐙'
  }
]
```

### 5. Colors and Theme
Modify colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#ffffff',
    dark: '#f8f9fa',
  },
  accent: {
    blue: '#2563eb',
    'sky-blue': '#0ea5e9',
    gold: '#f59e0b',
  }
}
```

### 6. Contact Form
The contact form is currently set up for demonstration. To make it functional:

1. **Email Service**: Integrate with services like EmailJS, Formspree, or your own backend
2. **Form Validation**: Add more comprehensive validation
3. **Success/Error Handling**: Improve user feedback

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Intersection Observer**: Scroll-based animations
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📱 Responsive Design

The website is built with a mobile-first approach and includes:

- Responsive navigation with hamburger menu
- Flexible grid layouts
- Optimized typography scaling
- Touch-friendly interactions
- Proper spacing for all screen sizes

## 🎭 Animations

- **Page Load**: Smooth fade-in with loading screen
- **Scroll Animations**: Elements animate as they enter viewport
- **Hover Effects**: Interactive feedback on buttons and cards
- **Theme Toggle**: Smooth transition between light/dark modes
- **Navigation**: Active section highlighting with underline animation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Follow React best practices
- Use functional components with hooks
- Implement proper TypeScript if needed
- Keep components under 200-300 lines
- Use semantic HTML structure

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Vercel will auto-detect Vite configuration
3. Deploy with one click

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder
3. Configure build settings if needed

### GitHub Pages
1. Add `"homepage": "https://yourusername.github.io/portfolio"` to package.json
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add deploy script: `"deploy": "gh-pages -d dist"`
4. Run `npm run build && npm run deploy`

## 📝 TODO

- [ ] Add TypeScript support
- [ ] Implement blog section
- [ ] Add portfolio filters
- [ ] Integrate with CMS for content management
- [ ] Add analytics tracking
- [ ] Implement SEO optimization
- [ ] Add PWA capabilities
- [ ] Create admin dashboard for content updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for build tooling
- [React](https://reactjs.org/) for the framework

---

**Built with ❤️ using React, Vite, and Tailwind CSS** 