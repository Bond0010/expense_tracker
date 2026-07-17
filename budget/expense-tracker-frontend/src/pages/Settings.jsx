import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Settings() {
  const [profile, setProfile] = useState({ full_name: "", email: "", avatar: null });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000/api/users";

  // 🔑 Get logged-in user & token
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const USER_ID = user?.id; // dynamic user id from backend

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch profile from backend
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${USER_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile({
          full_name: res.data.full_name,
          email: res.data.email,
          avatar: res.data.avatar || null,
        });

        if (res.data.avatar) {
          setAvatarPreview(`${API_BASE}/avatars/${res.data.avatar}`);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          alert("Failed to fetch profile");
        }
      }
    };

    fetchProfile();

    // Fetch voice setting from localStorage
    const storedVoice = localStorage.getItem("voiceEnabled");
    if (storedVoice !== null) setVoiceEnabled(storedVoice === "true");
  }, [USER_ID, token, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setProfile({ ...profile, avatar: file });
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveSettings = async () => {
    if (!token) return navigate("/login");

    try {
      const formData = new FormData();
      formData.append("full_name", profile.full_name);
      formData.append("email", profile.email);
      if (profile.avatar instanceof File) {
        formData.append("avatar", profile.avatar);
      }

      await axios.put(`${API_BASE}/${USER_ID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("voiceEnabled", voiceEnabled);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert("❌ Failed to update profile");
      }
    }
  };

  const changePassword = async () => {
    const oldPassword = prompt("Enter old password:");
    const newPassword = prompt("Enter new password:");
    if (!oldPassword || !newPassword) return;

    try {
      await axios.put(
        `${API_BASE}/${USER_ID}/change-password`,
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Password updated successfully!");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(err.response?.data?.message || "❌ Failed to change password");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />

        <div>
          <label className="block mb-1">Avatar</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="w-24 h-24 mt-2 rounded-full object-cover"
            />
          )}
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
          />
          <span>Enable Voice Alerts</span>
        </label>

        <button
          onClick={saveSettings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Save Profile
        </button>

        <button
          onClick={changePassword}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
