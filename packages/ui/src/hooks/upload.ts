import axios from 'axios';
import { useState, useCallback, useRef, useEffect } from 'react';

export function useUpload({ initialFiles, createFile }: UseUploadProps) {
  const [files, setFiles] = useState<FileFragment[]>(initialFiles);
  const fileMap = useRef(new Map<string, FileFragment>());
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController>();

  const [progressMap, setProgressMap] = useState(new Map<string, number>());

  useEffect(() => {
    initialFiles.forEach((file) => {
      fileMap.current.set(file.id, file);
    });
  }, [initialFiles]);

  const addFile = useCallback(
    async (data: File) => {
      const file = await createFile(data);

      fileMap.current.set(file.id, file);
      setFiles(Array.from(fileMap.current.values()));

      const formData = new FormData();
      formData.append('file', data);

      setIsUploading(true);
      await axios.put(file.url, data, {
        headers: {
          'Content-Type': data.type,
        },
        signal: abortControllerRef.current?.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = !progressEvent.total
            ? 0
            : Math.round((progressEvent.loaded * 100) / progressEvent.total);

          setProgressMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(file.id, percentCompleted);

            return newMap;
          });
        },
      });

      return file;
    },
    [createFile],
  );

  const removeFile = useCallback((id: string) => {
    fileMap.current.delete(id);
    setFiles(Array.from(fileMap.current.values()));
  }, []);

  return {
    files,
    addFile,
    removeFile,
    progressMap,
    isUploading,
  };
}

export type CreateFile = (file: File) => Promise<FileFragment>;
interface UseUploadProps {
  initialFiles: FileFragment[];
  createFile: CreateFile;
}

interface FileFragment {
  id: string;
  url: string;
  name: string;
}

// const createFile = useCallback(async (file: File) => {
//   const response = await fetch('/api/file', {
//     method: 'POST',
//     body: JSON.stringify({
//       contentLength: file.size,
//       name: file.name,
//       contentType: file.type,
//     }),
//   });

//   if (response.ok) {
//     const json = await response.json();
//     return json as FileFragment;
//   }
// }, []);
