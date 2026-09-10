"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded mock authentication
    if (email === "admin@tapsh.com" && password === "admin123") {
      // Simulate setting a session cookie
      document.cookie = "tapsh_admin_session=mock_token; path=/";
      router.push("/admin");
    } else {
      setError("Invalid credentials. Please use admin@tapsh.com / admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tapsh-pale-blue">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-tapsh-charcoal/20 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-tapsh-soft-green"></div>

        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl font-bold tracking-widest text-tapsh-black mb-2">TAPSH</h1>
          <p className="text-sm font-bold tracking-widest uppercase text-tapsh-charcoal">Admin Gateway</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-tapsh-black mb-2">Admin Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/50 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-sm"
              placeholder="admin@tapsh.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-tapsh-black mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/50 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-tapsh-black text-tapsh-pale-blue rounded-xl font-bold hover:bg-tapsh-black transition-colors shadow-md mt-4"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-medium text-tapsh-charcoal">
            For development: Use admin@tapsh.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
