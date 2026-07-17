import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import budget1 from "../assets/budget1.jpg";
import budget2 from "../assets/budget2.jpg";
import budget3 from "../assets/budget3.jpg";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // ✅ Save user + token
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.userId,
          token: data.token,
          fullName: data.fullName,
          email: data.email,
        })
      );
      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (err) {
      setError("Server error, please try again later");
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        <div className="slideshow">
          <div style={{backgroundImage: `url(${budget3})`}} className="slide bg-[url('https://source.unsplash.com/1600x900/?technology,1')]"></div>
          <div style={{backgroundImage: `url(${budget1})`}} className="slide bg-[url('https://source.unsplash.com/1600x900/?abstract,2')]"></div>
          <div style={{backgroundImage: `url(${budget2})`}} className="slide bg-[url('https://source.unsplash.com/1600x900/?office,3')]"></div>
        </div>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg w-96 animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <p className="text-gray-600 text-center mb-6">Welcome back 👋</p>
        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg"
        >
          Login
        </button>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
