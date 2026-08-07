import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full h-14 ${icon ? 'pl-12' : 'pl-4'} pr-4 rounded-lg border-2 border-surface-dim
              tactile-input font-body text-body-md bg-surface-bright
              placeholder:text-outline transition-colors
              ${error ? 'border-error' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-caption font-body text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor={props.id}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full p-4 rounded-lg border-2 border-surface-dim
            tactile-input font-body text-body-md bg-surface-bright
            placeholder:text-outline transition-colors resize-none
            ${error ? 'border-error' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-caption font-body text-error">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor={props.id}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full h-14 px-4 rounded-lg border-2 border-surface-dim
            tactile-input font-body text-body-md bg-surface-bright
            transition-colors appearance-none cursor-pointer
            ${error ? 'border-error' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-caption font-body text-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
