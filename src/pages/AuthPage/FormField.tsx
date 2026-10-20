import type { InputHTMLAttributes } from "react";

const inputBase =
    "w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors disabled:opacity-60";

const fieldClass = (hasError: boolean) =>
    `${inputBase} ${
        hasError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
    }`;

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label: string;
    error?: string;
}

function FormField({ name, label, error, ...inputProps }: FormFieldProps) {
    const errorId = `${name}-error`;

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={name}
                name={name}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={fieldClass(!!error)}
                {...inputProps}
            />
            {error && (
                <p id={errorId} className="text-xs text-red-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}

export default FormField;
