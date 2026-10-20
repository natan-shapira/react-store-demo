import type { SigninData, SignupFormData } from "../types";

export type AuthFormErrors = Partial<Record<keyof SignupFormData | "general", string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 characters, with one lowercase letter, one uppercase letter and one digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateSignup = (data: SignupFormData): AuthFormErrors => {
    const errors: AuthFormErrors = {};

    if (!data.firstName) errors.firstName = "First name is required";
    if (!data.lastName) errors.lastName = "Last name is required";

    if (!data.email) {
        errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(data.email)) {
        errors.email = "Invalid email address";
    }

    if (!data.username) errors.username = "Username is required";

    if (!data.password) {
        errors.password = "Password is required";
    } else if (!PASSWORD_REGEX.test(data.password)) {
        errors.password = "Password must be at least 8 characters and include uppercase, lowercase and a number";
    }

    if (!data.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (data.confirmPassword !== data.password) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};

export const validateSignin = (data: SigninData): AuthFormErrors =>
    !data.username || !data.password ? { general: "Please fill in all fields" } : {};
