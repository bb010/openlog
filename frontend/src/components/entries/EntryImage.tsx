import { useState } from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';
import { API_URL } from '@/utils/constants';
import { Modal } from '@/components/common/Modal';

interface EntryImageProps {
  imagePath: string;
  alt?: string;
  className?: string;
}

/**
 * Lazy-loading image display with zoom modal
 */
export function EntryImage({ imagePath, alt = 'Entry image', className }: EntryImageProps) {
  const [error, setError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Build full URL for images stored on the backend
  const imageUrl = imagePath.startsWith('http')
    ? imagePath
    : `${API_URL}/api/images/${imagePath}`;

  if (error) {
    return (
      <div className="flex items-center justify-center h-24 w-24 bg-gray-100 rounded-lg border border-gray-200">
        <ImageOff className="h-6 w-6 text-gray-300" />
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative cursor-pointer group overflow-hidden rounded-lg ${className}`}
        onClick={() => setIsZoomed(true)}
      >
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="w-24 h-24 object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Full-size zoom modal */}
      <Modal isOpen={isZoomed} onClose={() => setIsZoomed(false)} size="xl">
        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
}

export default EntryImage;
