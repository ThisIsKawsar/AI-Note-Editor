import React from "react";

export default function Login() {
    const handleGoogleLogin = () => {
        window.location.href = "/auth/google/redirect";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">AI Note Editor</h1>
                <button
                    onClick={handleGoogleLogin}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}