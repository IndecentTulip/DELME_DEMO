# 360° Panorama Viewer - Next.js App

A modern, interactive 360-degree panorama viewer built with Next.js and Google Street View API.

## Features

- 🌍 Interactive 360° Street View panoramas
- 📍 Pre-defined popular tourist locations
- 🎯 Custom coordinate input
- 🖱️ Intuitive mouse and touch controls
- 📱 Fully responsive design
- ⚡ Built with Next.js 15 and TypeScript
- 🎨 Styled with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- A Google Cloud account with Maps JavaScript API enabled
- A valid Google Maps API key

## Setup Instructions

1. **Clone or navigate to the project directory**
   ```bash
   cd panorama-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Maps API Key**
   
   a. Get your API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

   b. Add your API key to the environment:
   - Copy `.env.example` to `.env.local`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Controls
- **Click and drag**: Look around 360°
- **Scroll/Pinch**: Zoom in and out
- **Arrow overlays**: Navigate to nearby locations

### Features
1. **Location Selection**: Choose from popular tourist destinations in the dropdown
2. **Custom Coordinates**: Click "Enter Custom Location" and input latitude/longitude
3. **Fullscreen**: Use the fullscreen button for an immersive experience
4. **Navigation**: Click on the arrow overlays to move through connected locations

## Project Structure

```
panorama-viewer/
├── app/
│   ├── page.tsx         # Main page component
│   ├── layout.tsx       # Root layout with metadata
│   └── globals.css      # Global styles
├── components/
│   └── StreetViewPanorama.tsx  # Main panorama component
├── .env.local           # Environment variables (create this)
├── .env.example         # Example environment file
└── package.json         # Dependencies and scripts
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the environment variables
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Node.js

## Troubleshooting

### "InvalidKeyMapError"
- Ensure your API key is correctly added to `.env.local`
- Verify the Maps JavaScript API is enabled in Google Cloud Console
- Check that your API key has the correct restrictions

### Street View not loading
- Some locations may not have Street View coverage
- Try a different location or use the pre-defined locations
- Check your internet connection

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
