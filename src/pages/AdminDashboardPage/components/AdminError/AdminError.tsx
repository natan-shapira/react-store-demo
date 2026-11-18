import QueryError from "../../../../components/QueryError/QueryError";

interface AdminErrorProps {
  error: unknown;
  // Shown when the error has no message of its own, e.g. "Failed to load order statuses"
  fallbackMessage: string;
  onRetry: () => void;
}

// Takes the chart's place when its data fails to load. QueryError decides the message and
// whether "Try again" is offered, so admin pages handle errors the same way as the store.
function AdminError({ error, fallbackMessage, onRetry }: AdminErrorProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <QueryError error={error} fallbackMessage={fallbackMessage} onRetry={onRetry} />
    </div>
  );
}

export default AdminError;
