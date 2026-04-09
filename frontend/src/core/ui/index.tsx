import { forwardRef, useState, useRef, useEffect, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// ---- Field wrapper ----
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

// ---- Input ----
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, label, className, type = 'text', ...props }, ref) => {
    const input = (
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          {...props}
          className={`
            w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl
            px-4 py-3 text-sm placeholder:text-gray-400
            focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:bg-white
            transition-all
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${icon ? 'pl-10' : ''}
            ${className ?? ''}
          `}
        />
      </div>
    );

    if (label) return <Field label={label}>{input}</Field>;
    return input;
  }
);
Input.displayName = 'Input';

// ---- Select customizado ----
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({ label, options, placeholder, value, onChange, disabled, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={`
          w-full bg-gray-50 border text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? 'border-red-500 bg-white ring-2 ring-red-500/10' : 'border-gray-200 hover:border-gray-300'}
          ${!selected ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <span className="truncate">{selected ? selected.label : (placeholder ?? 'Selecione')}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1">
            {placeholder && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                {placeholder}
                {value === '' && <Check size={14} className="text-red-500" />}
              </button>
            )}
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between
                  ${option.value === value ? 'text-red-600 font-medium bg-red-50' : 'text-gray-900'}
                `}
              >
                {option.label}
                {option.value === value && <Check size={14} className="text-red-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (label) return <Field label={label}>{select}</Field>;
  return select;
}

// ---- Textarea ----
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  const textarea = (
    <textarea
      {...props}
      className={`
        w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl
        px-4 py-3 text-sm placeholder:text-gray-400 resize-none
        focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:bg-white
        transition-all
        ${className ?? ''}
      `}
    />
  );

  if (label) return <Field label={label}>{textarea}</Field>;
  return textarea;
}

// ---- Button ----
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-lg',
    md: 'px-5 py-3 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-sm rounded-xl',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        font-semibold border transition-all inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${className ?? ''}
      `}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Aguarde...
        </>
      ) : children}
    </button>
  );
}

// ---- Card ----
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className ?? ''}`}>
      {children}
    </div>
  );
}

// ---- Alert ----
export function Alert({ message, variant = 'error' }: { message: string; variant?: 'error' | 'success' | 'info' }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-600',
    success: 'bg-green-50 border-green-200 text-green-600',
    info: 'bg-blue-50 border-blue-200 text-blue-600',
  };

  return (
    <div className={`border rounded-xl px-4 py-3 text-sm text-center ${styles[variant]}`}>
      {message}
    </div>
  );
}