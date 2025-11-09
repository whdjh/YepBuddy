declare module 'react-hook-form' {
  import type { ComponentType } from 'react';

  export type SubmitHandler<TFieldValues> = (data: TFieldValues, event?: unknown) => unknown;

  export interface UseFormProps<TFieldValues> {
    mode?: string;
    defaultValues?: TFieldValues;
    shouldUnregister?: boolean;
  }

  export interface UseFormReturn<TFieldValues> {
    handleSubmit: (handler: SubmitHandler<TFieldValues>) => (event?: unknown) => unknown;
    watch: (names?: Array<keyof TFieldValues>) => Array<TFieldValues[keyof TFieldValues]>;
  }

  export function useForm<TFieldValues = Record<string, any>>(props?: UseFormProps<TFieldValues>): UseFormReturn<TFieldValues>;

  export interface FormProviderProps<TFieldValues> extends UseFormReturn<TFieldValues> {
    children?: React.ReactNode;
  }

  export const FormProvider: <TFieldValues>(props: FormProviderProps<TFieldValues>) => React.ReactElement;
}
