/**
 * מעצב מספר למחצית/מחיר נקי עם סימן מטבע מוגדר
 */
export const formatPrice = (price: number): string => {
  // תוכל להתאים את הפורמט לסימן המטבע שבו הפרויקט משתמש (למשל $ או ₪)
  return `$${price.toFixed(2)}`;
};