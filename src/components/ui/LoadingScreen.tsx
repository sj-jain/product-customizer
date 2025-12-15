import { useAppStore } from '../../store/useAppStore';

function LoadingScreen() {
  const isLoading = useAppStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">Loading 3D Model...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;

