import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../../lib/api';
import { toast } from '../../lib/toast';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUploader({ onUploadSuccess, currentImage, label = "Product Image" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      setUploading(true);
      const data = await uploadImage(file);
      onUploadSuccess(data.url);
      toast.success('Image uploaded successfully / تم رفع الصورة بنجاح');
    } catch (err: any) {
      toast.error('Upload failed / فشل رفع الصورة');
      console.error(err);
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUploadSuccess('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4 w-full">
      <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative aspect-[4/5] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden group ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="text-white w-8 h-8" />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Uploading...</span>
              </div>
            )}
            <button
              onClick={removeImage}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-20"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="text-gray-300 w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              {isDragActive ? "Drop Here" : "Drag & Drop Image"}
            </p>
            <p className="text-[10px] text-gray-300 uppercase font-bold">or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
}
