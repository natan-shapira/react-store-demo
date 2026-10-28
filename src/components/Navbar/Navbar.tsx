import { Link, NavLink } from "react-router-dom";
import { useCartStore } from "../../stores/useCartStore";
import { AlertCircle, Camera, House, LogOut, ShoppingBag, Store, User } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useRef, useState } from "react";
import { compressImage } from "../../utils/compressImage";


function Navbar() {
    const totalItems = useCartStore((state) =>
      Object.values(state.items).reduce((sum, item) => sum + item.quantity, 0)
    );
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const logout = useAuthStore((state) => state.logout);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive
        ? 'bg-blue-600 text-white font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      input.value = "";
      if (!file || !user) return;

      try {
        updateUser(user.id, await compressImage(file));
      } catch {
        setImageError("Could not load this image. Please choose a different file.");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        } 
        timeoutRef.current = setTimeout(() => {
          setImageError(null);
        }, 5000);
      }
    };
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* לוגו / כותרת האתר */}
        <Link to="/">
          <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <Store className="w-6 h-6" />
            <span>ReactShop</span>
          </div>
        </Link>

        {/* קישורי ניווט */}
        <div className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            <House className="w-4 h-4" />
            Home
          </NavLink>

          <NavLink to="/cart" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <ShoppingBag className="w-4 h-4" />
                Cart
                {totalItems > 0 && (
                  <span
                    className={`min-w-5 h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                      isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                    }`}
                    aria-label={`${totalItems} ${totalItems === 1 ? "item" : "items"} in cart`}
                  >
                    {totalItems}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {!user &&
            <NavLink to="/auth" className={navLinkClass}>
              <User className="w-4 h-4" />
              Sign in / Sign up
            </NavLink>
          }
        </div>

        {/* הצגת שם המשתמש אם מחובר */}
        {user && (
          <div className="flex items-center gap-4 relative">
            {imageError && (
              <div role="alert" className="absolute top-16 right-0 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 animate-fade-in z-50 whitespace-nowrap">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}
            {/* פעולות משתמש */}
            <div className="flex items-center gap-3 bg-gray-50/80 p-1.5 pl-3 rounded-2xl border border-gray-100">
              {/* תמונת פרופיל / אוואטר עם אפקט הדרכה והעלאת קובץ */}
              <button 
                type="button"
                aria-label="Change profile picture"
                className="relative group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile picture"              
              >
                <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-white shadow-xs overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.firstName?.[0] || user.username[0]}</span>
                  )}
                </span>
                {/* Hover Camera Overlay */}
                <span className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {/* Logout Button */}
            <button
              type="button"
              aria-label="Logout"
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;