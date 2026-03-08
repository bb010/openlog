import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES, ERROR_MESSAGES } from '@/utils/constants';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  currentImageUrl?: string;
  className?: string;
}

/**
 * Drag-and-drop image upload component — uses shadcn Button
 */
export function ImageUpload({ onUpload, isLoading = false, currentImageUrl, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(ERROR_MESSAGES.INVALID_IMAGE_TYPE);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(ERROR_MESSAGES.IMAGE_TOO_LARGE);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className={cn('space-y-3', className)}>
      {displayImage ? (
        <div className="relative">
          <img
            src={displayImage}
            alt="Upload preview"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm mb-1">
            <span className="text-primary font-medium">Click to upload</span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 10MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />

      {!displayImage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="w-full"
        >
          <Upload className="h-4 w-4" />
          {isLoading ? 'Uploading...' : 'Choose Image'}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default ImageUpload;
