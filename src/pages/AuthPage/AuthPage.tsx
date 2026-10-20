import { AlertCircle, Loader2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import type { SigninData, SignupData } from "../../types";
import { type AuthFormErrors, validateSignin, validateSignup } from "../../validators/authValidators";
import FormField from "./FormField";

function AuthPage() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const { login, signup, isLoading, error, clearError } = useAuthStore();
    const [formErrors, setFormErrors] = useState<AuthFormErrors>({});

    const switchMode = () => {
        clearError();
        setFormErrors({});
        setIsSignUp((prev) => !prev);
    };

    const handleFieldChange = (e: React.FormEvent<HTMLFormElement>) => {
        const field = (e.target as HTMLInputElement).name as keyof AuthFormErrors;
        // A mismatch can be fixed from either password field
        const fields: (keyof AuthFormErrors)[] =
            field === "password" ? ["password", "confirmPassword"] : [field];

        setFormErrors((prev) => {
            if (!prev.general && fields.every((name) => !prev[name])) return prev;
            const next = { ...prev, general: undefined };
            fields.forEach((name) => (next[name] = undefined));
            return next;
        });
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        const formData = new FormData(e.currentTarget);
        const getText = (name: string) => String(formData.get(name) ?? "").trim();
        // Passwords may legitimately contain leading or trailing spaces
        const password = String(formData.get("password") ?? "");
        const username = getText("username");

        if (isSignUp) {
            const signupData: SignupData = {
                username,
                password,
                email: getText("email"),
                firstName: getText("firstName"),
                lastName: getText("lastName"),
            };
            const confirmPassword = String(formData.get("confirmPassword") ?? "");

            const errors = validateSignup({ ...signupData, confirmPassword });
            setFormErrors(errors);
            if (Object.keys(errors).length > 0) return;

            if (await signup(signupData)) {
                navigate("/");
            }
        } else {
            const signinData: SigninData = { username, password };

            const errors = validateSignin(signinData);
            setFormErrors(errors);
            if (Object.keys(errors).length > 0) return;

            if (await login(signinData)) {
                navigate("/");
            }
        }
    };

    const bannerError = error || formErrors.general;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
                {/* כותרת ראשית */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2">
                        {isSignUp ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        {isSignUp ? "Create an Account" : "Welcome Back"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isSignUp
                        ? "Sign up to enjoy a complete shopping experience"
                        : "Enter your credentials (e.g., emilys / emilyspass)"}
                    </p>
                </div>

                {bannerError && (
                    <div
                        role="alert"
                        className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                        <span>{bannerError}</span>
                    </div>
                )}

                {/* key מאפס את שדות הטופס במעבר בין התחברות להרשמה */}
                <form
                    key={isSignUp ? "signup" : "signin"}
                    onSubmit={handleSubmit}
                    onChange={handleFieldChange}
                    className="space-y-4"
                    noValidate
                >
                    {isSignUp && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    name="firstName"
                                    label="First name"
                                    type="text"
                                    autoComplete="given-name"
                                    disabled={isLoading}
                                    error={formErrors.firstName}
                                />
                                <FormField
                                    name="lastName"
                                    label="Last name"
                                    type="text"
                                    autoComplete="family-name"
                                    disabled={isLoading}
                                    error={formErrors.lastName}
                                />
                            </div>
                            <FormField
                                name="email"
                                label="Email"
                                type="email"
                                autoComplete="email"
                                disabled={isLoading}
                                error={formErrors.email}
                            />
                        </>
                    )}

                    <FormField
                        name="username"
                        label="Username"
                        type="text"
                        autoComplete="username"
                        disabled={isLoading}
                        error={formErrors.username}
                    />

                    <FormField
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        disabled={isLoading}
                        error={formErrors.password}
                    />

                    {isSignUp && (
                        <FormField
                            name="confirmPassword"
                            label="Confirm password"
                            type="password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            error={formErrors.confirmPassword}
                        />
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isSignUp ? "Creating account..." : "Signing in..."}
                            </>
                        ) : isSignUp ? (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Sign up
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign in
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        type="button"
                        onClick={switchMode}
                        disabled={isLoading}
                        className="font-semibold text-blue-600 hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default AuthPage;
