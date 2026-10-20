import { ArrowLeft, House, SearchX } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function NotFoundPage() {
    const navigate = useNavigate();
    const location = useLocation();
    // React Router gives the first history entry the key "default", so there is nowhere to go back to
    const canGoBack = location.key !== "default";

    return (
        <div className="flex flex-col items-center justify-center text-center py-20">
            <title>Page not found | ReactShop</title>

            <SearchX className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-sm font-semibold text-blue-600 mb-2">404</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
            <p className="text-gray-500 mb-6 max-w-md break-all">
                We couldn't find <code className="font-mono text-gray-700">{location.pathname}</code>. It may have
                been moved, or the address may be incorrect.
            </p>

            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    <House className="w-4 h-4" />
                    Back to home
                </Link>
                {canGoBack && (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </button>
                )}
            </div>
        </div>
    );
}

export default NotFoundPage;
