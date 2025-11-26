import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 resize-none';
    const defaultClasses = 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    const errorClasses = 'border-red-300 focus:ring-red-500 focus:border-red-500';
    const disabledClasses = 'bg-gray-50 text-gray-500 cursor-not-allowed';
    
    const textareaClasses = `
      ${baseClasses}
      ${error ? errorClasses : defaultClasses}
      ${props.disabled ? disabledClasses : 'bg-white'}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClasses}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

