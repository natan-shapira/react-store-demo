import { useCategories } from "../../api/products";

interface CategoriesNavbarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

function CategoriesNavbar({ selectedCategory, onSelectCategory }: CategoriesNavbarProps) {
  const { data: categories } = useCategories();

  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
      {/* כפתור "הכל" */}
      <button 
        type="button"
        onClick={() => onSelectCategory(null)}
        aria-pressed={selectedCategory === null}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
          selectedCategory === null 
            ? "bg-blue-600 text-white shadow-sm" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {/* רצת על מערך האובייקטים שהתקבל מה-API */}
      {categories?.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.slug} // ה-slug משמש כמפתח ייחודי
            type="button"
            onClick={() => onSelectCategory(cat.slug)} // שולחים את ה-slug לסינון (למשל "beauty")
            aria-pressed={isSelected}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isSelected 
                ? "bg-blue-600 text-white shadow-sm" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name} {/* מציגים למשתמש את השם היפה (למשל "Beauty") */}
          </button>
        );
      })}
    </div>
  );
}

export default CategoriesNavbar;