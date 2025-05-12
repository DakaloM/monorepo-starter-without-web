import { useCallback, useState } from 'react';
import * as z from 'zod';

export function useForm<T extends z.ZodObject<any>>({
  schema,
  onCompleted,
  submit,
}: UseFormProps<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = useCallback(
    async (values: z.infer<T>) => {
      setLoading(true);
      setError('');
      try {
        const parsed = schema.safeParse(values);
        if (parsed.success === false) {
          return setError(parsed.error.message);
        }

        await submit(parsed.data);

        // const response = await fetch('/api/login', {
        //   method: 'POST',
        //   body: JSON.stringify(parsed),
        // });

        setLoading(false);
      } catch (err) {
        setLoading(false);
        return setError(err.message);
      }

      return onCompleted();
    },
    [onCompleted, submit, schema],
  );

  return {
    onSubmit,
    loading,
    error,
  };
}
interface UseFormProps<T extends z.ZodObject<any>> {
  schema: T;
  onCompleted: () => void;
  submit: (schema: z.infer<T>) => void;
}
