<div align="left">
  
  
  # Facial Motion Capture
  
  **Real-time face tracking with 3D avatars in your browser** ✨
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
  
</div>

---

## 🚀 Quick Start

### Get Started
```bash
# Clone the project
git clone https://github.com/PooyaDeperson/facial-motion-capture.git
cd facial-motion-capture

# Install dependencies
npm install

# Start the service
npm start
```

Visit `http://localhost:3000` to see the face tracking in action!

### System Requirements
- Node.js 16+
- A modern browser with webcam access
- Webcam permissions (for face tracking)

---

## 💫 Project Vision

This project aims to provide a simple and effective way to perform real-time face tracking in the browser using Ready Player Me avatars. It leverages the power of MediaPipe and Three.js to create an immersive experience where a 3D avatar mimics your facial movements.

---

## 🎯 Current Feature Status

### ✅ Implemented Features
- **🎤 Real-time Face Tracking**: Captures facial landmarks using MediaPipe.
- **🎬 3D Avatar Integration**: Renders Ready Player Me avatars with Three.js.
- **🎨 Avatar and Color Switcher**: Easily switch between different avatars and background colors.
- **⚙️ Component-Based Architecture**: Built with React for a modular and maintainable codebase.
- **🌐 Web Application**: Runs entirely in the browser.

---

## 🏗️ Technical Architecture

### Core Design Principles
- **Performance**: Optimized for real-time performance in the browser.
- **Modularity**: Components are designed to be reusable and easy to understand.
- **Simplicity**: A straightforward setup and easy-to-follow codebase.

### Technology Stack
- **Frontend**: React, TypeScript, Three.js, react-three/fiber, react-three/drei
- **Face Tracking**: MediaPipe Tasks Vision
- **Build Tool**: Create React App

---

## 🛠️ Development Guide

### Environment Setup
1. Ensure you have Node.js installed (version 16 or higher).
2. Run `npm install` to install the necessary dependencies.
3. Run `npm start` to launch the development server.

### Contribution Guidelines
1. Fork the project repository.
2. Create a new branch for your feature (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add some amazing feature'`).
4. Push your changes to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.


---

## 📁 Project Structure

```
rpm-face-tracking/
├── 📄 .gitignore          # Specifies intentionally untracked files to ignore
├── 📄 package.json        # Lists the project's dependencies and scripts
├── 📄 package-lock.json  # Records the exact version of each installed package
├── 📄 README.md           # This file, providing an overview of the project
├── 📄 tsconfig.json       # The configuration file for the TypeScript compiler
├── 📁 public/              # Contains static assets that are publicly accessible
│   ├── 📁 avatar/          # Stores the 3D avatar models in .glb format
│   ├── 📁 images/         # Contains various image assets for the application
│   ├── 📄 index.html      # The main HTML file that serves as the entry point
│   └── 📄 logo.png        # The project's logo
└── 📁 src/                # Contains the main source code for the application
    ├── 📁 components/     # Reusable React components used throughout the app
    │   ├── 📄 AvatarSwitcher.tsx # Allows users to switch between different avatars
    │   ├── 📄 ColorSwitcher.tsx  # Enables changing the background color
    │   └── 📄 CustomDropdown.tsx # A custom dropdown component for UI elements
    ├── 📁 hooks/          # Custom React hooks for managing state and logic
    ├── 📁 icons/          # SVG icons used in the user interface
    ├── 📁 images/         # Image assets specific to components
    ├── 📄 App.css         # Styles for the main application component
    ├── 📄 App.tsx         # The root component of the application
    ├── 📄 Avatar.tsx      # Renders the 3D avatar model
    ├── 📄 AvatarCanvas.tsx # The Three.js canvas where the avatar is displayed
    ├── 📄 AvatarOrbitControls.tsx # Implements camera controls for the avatar
    ├── 📄 camera-permission.tsx # Handles requesting and managing camera permissions
    ├── 📄 FaceTracking.tsx # The core logic for tracking the user's face
    ├── 📄 index.css       # Global styles for the application
    ├── 📄 index.tsx       # The entry point for the React application
    ├── 📄 Loader.tsx      # A loading avatar indicator component
    └── 📄 react-app-env.d.ts # TypeScript type declarations for the React environment
```
