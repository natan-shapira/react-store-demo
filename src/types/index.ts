export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
}

export type SigninData = Pick<User, "username"> & {
  password: string;
};

export type SignupData = Omit<User, "id" | "image"> & {
  password: string;
};

export type SignupFormData = SignupData & {
  confirmPassword: string;
};

