import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      login(data.user.username);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
            <img src="/griffin-logo.png" alt="Griffin Logo" className="h-full w-full object-cover" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 font-display">
          Griffin SOC
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enterprise Security Operations Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200">
          <div className="flex justify-center mb-6 border-b border-slate-200">
            <button
              className={`pb-3 px-4 text-sm font-medium border-b-2 ${isLogin ? 'border-[#0f1b3d] text-[#0f1b3d]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`pb-3 px-4 text-sm font-medium border-b-2 ${!isLogin ? 'border-[#0f1b3d] text-[#0f1b3d]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-[#0f1b3d] focus:outline-none focus:ring-[#0f1b3d] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-[#0f1b3d] focus:outline-none focus:ring-[#0f1b3d] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-[#0f1b3d] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#0f1b3d] focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Processing..." : isLogin ? "Sign in to Console" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
