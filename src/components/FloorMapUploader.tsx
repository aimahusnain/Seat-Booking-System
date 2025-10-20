// components/FloorMapUploader.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FloorMapImage {
  id: string;
  filename: string;
  data: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export function FloorMapUploader() {
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<FloorMapImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchFloorMap();
    }
  }, [open]);

  const fetchFloorMap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/floor-map');
      const data = await response.json();
      
      if (data.image) {
        setCurrentImage(data.image);
      } else {
        setCurrentImage(null);
      }
    } catch (error) {
      console.error('Failed to fetch floor map:', error);
      toast.error('Failed to load floor map');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const response = await fetch('/api/floor-map', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            data: base64Data,
            mimeType: file.type,
            size: file.size,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success('Floor map uploaded successfully');
          setFile(null);
          setPreview(null);
          fetchFloorMap();
        } else {
          toast.error(result.error || 'Failed to upload floor map');
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload floor map');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(`/api/floor-map/${currentImage.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Floor map deleted successfully');
        setCurrentImage(null);
      } else {
        toast.error('Failed to delete floor map');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete floor map');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <ImageIcon className="mr-2 h-4 w-4" />
          FLOOR MAP
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Floor Map</SheetTitle>
          <SheetDescription>
            Upload or view your venue floor map
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            </div>
          ) : (
            <>
              {/* Show current image if exists */}
              {currentImage && (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={currentImage.data}
                      alt="Floor map"
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {currentImage.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(currentImage.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded:{' '}
                        {new Date(currentImage.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-4">
                      Replace Floor Map
                    </h3>
                  </div>
                </div>
              )}

              {/* Upload section */}
              <div className="space-y-4">
                {/* File input */}
                {!currentImage && !preview && (
                  <div className="space-y-4">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="floor-map-input"
                      />
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm mb-1">
                          <span className="font-medium text-primary">
                            Click to upload
                          </span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Preview */}
                {preview && (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    </div>
                    {file && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload button */}
                {file && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Floor Map
                      </>
                    )}
                  </Button>
                )}

                {/* Show upload option when image exists */}
                {currentImage && !preview && (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="floor-map-input-replace"
                    />
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm mb-1">
                        <span className="font-medium text-primary">
                          Click to upload new floor map
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}