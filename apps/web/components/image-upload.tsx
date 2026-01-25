"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { useQuery } from "convex/react";
import { GripVertical, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { useToast } from "@/hooks/useToast";
import { useMutation } from "convex/react";

type ImageUploadProps = {
  value: string[];
  onChange: (keys: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
};

export function ImageUpload({
  value,
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  // Use the R2 useUploadFile hook - it handles the entire upload process
  const uploadFile = useUploadFile(api.files);
  const deleteFile = useMutation(api.files.deleteFile);

  // Get URLs for all images
  const imageUrls = useQuery(
    api.files.getFileUrls,
    value.length > 0 ? { keys: value } : "skip"
  );

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - value.length;
      if (remainingSlots <= 0) {
        toast({
          title: "Maximum images reached",
          description: `You can only upload up to ${maxImages} images.`,
          variant: "destructive",
        });
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setIsUploading(true);

      try {
        const uploadedKeys: string[] = [];

        for (const file of filesToUpload) {
          // Validate file type
          if (!file.type.startsWith("image/")) {
            toast({
              title: "Invalid file type",
              description: `${file.name} is not an image file.`,
              variant: "destructive",
            });
            continue;
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "File too large",
              description: `${file.name} is too large. Maximum size is 10MB.`,
              variant: "destructive",
            });
            continue;
          }

          setUploadingFiles((prev) => new Set(prev).add(file.name));

          try {
            // Use the useUploadFile hook - it handles:
            // 1. Generating the signed URL
            // 2. Uploading the file to R2
            // 3. Syncing metadata to Convex
            // 4. Returning the key
            const key = await uploadFile(file);
            uploadedKeys.push(key);
          } catch (error: any) {
            console.error(`Upload error for ${file.name}:`, error);
            toast({
              title: "Upload failed",
              description: `Failed to upload ${file.name}. ${error.message}`,
              variant: "destructive",
            });
          } finally {
            setUploadingFiles((prev) => {
              const next = new Set(prev);
              next.delete(file.name);
              return next;
            });
          }
        }

        if (uploadedKeys.length > 0) {
          onChange([...value, ...uploadedKeys]);
          toast({
            title: "Upload successful",
            description: `Successfully uploaded ${uploadedKeys.length} image(s).`,
          });
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload images. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [value, maxImages, uploadFile, onChange, toast]
  );

  const handleRemove = useCallback(
    async (index: number) => {
      const key = value[index];
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);

      // Delete the file from storage
      try {
        await deleteFile({ key });
      } catch (error) {
        console.error("Failed to delete file:", error);
        // Don't show error to user since we've already removed it from the UI
      }
    },
    [value, onChange, deleteFile]
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== index) {
      const newValue = [...value];
      const draggedItem = newValue[draggedIndex];
      newValue.splice(draggedIndex, 1);
      newValue.splice(index, 0, draggedItem);
      onChange(newValue);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-gray-600">
          Drag and drop images here, or click to select
        </p>
        <p className="mb-4 text-gray-500 text-sm">
          {value.length}/{maxImages} images uploaded
        </p>
        <input
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading || value.length >= maxImages}
          id="image-upload-input"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          type="file"
        />
        <Button
          asChild
          disabled={disabled || isUploading || value.length >= maxImages}
          variant="outline"
        >
          <label className="cursor-pointer" htmlFor="image-upload-input">
            {isUploading ? "Uploading..." : "Choose Images"}
          </label>
        </Button>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {value.map((key, index) => {
            const imageUrl = imageUrls?.[index];
            return (
              <div
                key={key}
                className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100"
                draggable
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragStart={() => handleDragStart(index)}
              >
                {imageUrl ? (
                  <Image
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full object-cover"
                    height={200}
                    src={imageUrl}
                    width={200}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      className="rounded-full bg-white/90 hover:bg-white"
                      disabled={disabled}
                      onClick={() => handleRemove(index)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                    <div className="flex h-8 w-8 cursor-move items-center justify-center rounded-full bg-white/90">
                      <GripVertical className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-white text-xs font-medium">
                    Primary
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
