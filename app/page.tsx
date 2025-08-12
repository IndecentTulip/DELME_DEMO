import StreetViewPanorama from '@/components/StreetViewPanorama';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            360° Interactive Panorama Viewer
          </h1>
          <p className="text-gray-600">
            Explore the world in 360 degrees using Google Street View
          </p>
        </header>
        
        <main>
          <StreetViewPanorama />
        </main>
      </div>
    </div>
  );
}
