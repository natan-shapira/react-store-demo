import { AlertTriangle, House, RotateCcw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center text-center py-20 px-4">
      <AlertTriangle className="w-16 h-16 text-red-300 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        An unexpected error occurred while showing this page. You can try again, or go back to the
        home page.
      </p>

      {import.meta.env.DEV && (
        <pre className="mb-6 max-w-xl overflow-auto rounded-lg bg-red-50 p-3 text-left text-xs text-red-700">
          {error.message}
        </pre>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
        {/* A plain link forces a full page load, which also recovers from a page chunk that failed to download */}
        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <House className="w-4 h-4" />
          Back to home
        </a>
      </div>
    </div>
  );
}

export default ErrorFallback;
