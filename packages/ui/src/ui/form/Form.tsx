import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { DefaultValues, Path, useForm as useNativeForm } from 'react-hook-form';
import { TypeOf, z } from 'zod';

import { Button } from '../button';
import { Loader } from '../Loader';
import {
  Form as NativeForm,
  FormField as NativeFormField,
  FormItem,
  FormControl,
  FormMessage,
} from '../native-form';
import { useForm } from './hooks';

export function Form<T extends z.ZodObject<any, any>>(props: FormProps<T>) {
  const { onSubmit, error, loading } = useForm({
    schema: props.schema,
    submit: props.onSubmit,
    onCompleted: props.onCompleted,
  });

  const form = useNativeForm<z.infer<typeof props.schema>>({
    resolver: zodResolver(props.schema),
    defaultValues: (props.initialValues || {}) as DefaultValues<TypeOf<T>>,
  });

  const unhandledErrors = useMemo(() => {
    const { errors } = form.formState;
    return Object.keys(errors)
      .reduce((all, key) => {
        if (!props.fields.some((v) => v.name === key)) {
          all.push(`${key}: ${errors[key]?.message}`);
        }

        return all;
      }, [] as string[])
      .join('\n');
  }, [form.formState, props.fields]);

  return (
    <NativeForm {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-4">
        <section className="grid grid-cols-2 gap-4">
          {props.fields.map(({ name, Component, className, label }, index) => (
            <NativeFormField
              key={name.toString()}
              control={form.control}
              name={name as Path<z.infer<T>>}
              render={({ field }) => {
                return (
                  <FormItem className={className ?? 'col-span-2'}>
                    <FormControl>
                      <Component {...field} label={label} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ))}
        </section>
        {error && (
          <span className="py-2 text-sm font-bold text-destructive text-center">{error}</span>
        )}
        {unhandledErrors && (
          <span className="py-2 text-sm font-bold text-destructive text-center">
            {unhandledErrors}
          </span>
        )}
        {loading ? <Loader /> : <Button type="submit">{props.actionText || 'Save changes'}</Button>}
      </form>
    </NativeForm>
  );
}

export interface FormProps<T extends z.ZodObject<any, any>> {
  schema: T;
  initialValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void;
  onCompleted: () => void;
  fields: FieldProps<T>[];
  actionText?: string;
}

export interface FieldProps<T extends z.ZodObject<any, any>> {
  name: keyof z.infer<T>;
  label?: string;
  Component: (props: FormFieldProps<z.infer<T>[keyof z.infer<T>]>) => JSX.Element;
  className?: string;
}

export interface FormFieldProps<T> {
  initialValue?: T;
  label?: string;
  onChange: (update: T) => void;

}
