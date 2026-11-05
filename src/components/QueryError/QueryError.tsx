import { AlertCircle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { isRetryableError } from "../../api/shouldRetry";
import { getErrorMessage } from "../../utils/errors";

interface QueryErrorProps {
  error: unknown;
  fallbackMessage: string;
  onRetry: () => void;
  // Extra actions shown next to "Try again", e.g. a back button
  children?: ReactNode;
}

function QueryError({ error, fallbackMessage, onRetry, children }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 py-12"
    >
      <AlertCircle className="w-10 h-10 text-red-500" aria-hidden="true" />
      <p className="text-red-600 font-medium">{getErrorMessage(error, fallbackMessage)}</p>
      <div className="flex items-center gap-3">
        {isRetryableError(error) && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export default QueryError;
