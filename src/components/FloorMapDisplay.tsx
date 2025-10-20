// components/FloorMapDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FloorMapImage {
  id: string;
  filename: string;
  data: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface FloorMapDisplayProps {
  className?: string;
  showFilename?: boolean;
}

export function FloorMapDisplay({
  className = '',
  showFilename = false,
}: FloorMapDisplayProps) {
  const [image, setImage] = useState<FloorMapImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFloorMap();
  }, []);

  const fetchFloorMap = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/floor-map');
      const data = await response.json();

      if (response.ok && data.image) {
        setImage(data.image);
      } else {
        setImage(null);
      }
    } catch (err) {
      console.error('Failed to fetch floor map:', err);
      setError('Failed to load floor map');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading floor map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!image) {
    return (
      <div className={`flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No floor map available
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a floor map to display it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <img
          src={image.data}
          alt="Floor Map"
          className="w-full h-auto"
        />
      </div>
      {showFilename && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{image.filename}</p>
          <p className="text-xs">
            Uploaded: {new Date(image.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}