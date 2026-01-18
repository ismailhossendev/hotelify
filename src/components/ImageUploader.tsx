
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
    images: string[];
    onChange: (urls: string[]) => void;
    maxImages?: number;
}

export default function ImageUploader({ images = [], onChange, maxImages = 5 }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (images.length >= maxImages) {
            alert(`Maximum ${maxImages} images allowed.`);
            return;
        }

        setUploading(true);

        try {
            // 1. Client-Side Optimization (Resize)
            const optimizedFile = await resizeImage(file);

            // 2. Upload
            const formData = new FormData();
            formData.append('file', optimizedFile);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                onChange([...images, data.url]);
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (urlToDelete: string, index: number) => {
        if (!confirm("Delete this image?")) return;

        // Optimistic UI update
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);

        // API Call to remove file
        await fetch('/api/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlToDelete })
        });
    };

    const resizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 1920;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                    const height = (scaleSize < 1) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Canvas to Blob failed"));
                    }, file.type, 0.8); // 0.8 quality
                };
            };
            reader.onerror = reject;
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group">
                        <Image
                            src={url}
                            alt={`Room ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleDelete(url, index)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors text-gray-400 hover:text-blue-500"
                    >
                        {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <Upload className="h-6 w-6 mb-1" />
                                <span className="text-xs font-bold">Upload</span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-400">
                {images.length} / {maxImages} images. Optimized automatically.
            </p>
        </div>
    );
}
