/* eslint-disable no-restricted-imports */
import { FileIcon, RefreshCw, Trash2Icon, UploadIcon, XIcon } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import { CreateFile, useUpload } from '../../hooks';
import { cn } from '../../lib';
import { Button } from '../button';
import { Loader } from '../Loader';

export function FileUpload({
  createFile,
  onCompleted,
  UpdateDocumentForm,
  type,
  refId,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addFile, isUploading, removeFile, files, progressMap } = useUpload({
    initialFiles: [],
    createFile,
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => addFile(files[0]),
  });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;

    addFile(files[0]);
  };

  const handleComplete = useCallback(() => {
    onCompleted(files.map((file) => file.id));
  }, [files, onCompleted]);

  const allFilesUploaded = useMemo(
    () => [...progressMap.values()].every((f) => f === 100),
    [progressMap],
  );

  const dropRegionClassName = cn(
    'group hover:bg-primary/5 cursor-pointer hover:border-primary rounded-lg border-2 border-gray-400 border-dotted grid gap-4 place-items-center p-16',
    {
      'bg-primary/5 border-primary': isDragActive,
    },
  );

  return (
    <section className="grid gap-6">
      {!files.some((file) => progressMap.get(file.id) === 100) && (
        <>
          <input
            {...getInputProps()}
            ref={inputRef}
            className="hidden"
            type="file"
            onChange={onChange}
          />
          <div
            {...getRootProps()}
            className={dropRegionClassName}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon size={24} className="transform group-hover:animate-pulse" />
          </div>
        </>
      )}
      <div className="grid gap-4 overflow-y-auto">
        {files.map((file) => (
          <div className="grid place-items-center gap-4 border border-transparent hover:border-gray-200 rounded-lg p-4">
            <div key={file.id} className="flex gap-4">
              <FileIcon />
              <span className="grid flex-1">
                <span className="text-sm">{file.name}</span>
                {progressMap.has(file.id) && progressMap.get(file.id) !== 100 && (
                  <div className="flex relative w-full">
                    <div
                      style={{ width: `${progressMap.get(file.id)}%` }}
                      className={`z-0 absolute bg-primary h-full rounded-full shadow-md`}
                    />
                    <span className="z-10 text-white font-semibold py-px bg-primary/60 rounded-lg shadow-md text-xs text-center w-full">
                      {progressMap.get(file.id)}%
                    </span>
                  </div>
                )}
              </span>

              <Button
                size="sm"
                disabled={progressMap.get(file.id) !== 100}
                onClick={() => removeFile(file.id)}
                variant="link"
              >
                {progressMap.get(file.id) === 100 ? (
                  <Trash2Icon size={16} />
                ) : (
                  <Loader className="h-4 w-4" />
                )}
              </Button>
            </div>

            {progressMap.get(file.id) === 100 && (
              <UpdateDocumentForm
                fileId={file.id}
                type={type}
                onCompleted={handleComplete}
                refId={refId}
              />
            )}
          </div>
        ))}
      </div>
      {/* <Button onClick={handleComplete} disabled={!files.length || !allFilesUploaded}>
        Done
      </Button> */}
    </section>
  );
}

interface FileUploadProps {
  createFile: CreateFile;
  refId: string;
  onCompleted: (file: string[]) => void;
  type: string;
  UpdateDocumentForm: (props: UpdateDocumentFormProps) => JSX.Element;
}

type UpdateDocumentFormProps = {
  fileId: string;
  refId: string;
  type: string;
  onCompleted: () => void;
};
