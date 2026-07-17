import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // ✅ Load notifications on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(stored);

    // ✅ Listen for updates from other tabs/pages
    const handleStorage = () => {
      const updated = JSON.parse(localStorage.getItem("notifications")) || [];
      setNotifications(updated);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ✅ Replay or stop voice
  const replayVoice = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ✅ Clear all notifications
  const clearAll = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  // ✅ Remove one notification
  const removeOne = (id) => {
    const updated = notifications.filter((note) => note.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 italic text-center">
          🚫 No notifications yet.
        </p>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div
              key={note.id || Math.random()}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-medium">{note.message}</p>
                <p className="text-sm text-gray-500">{note.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => replayVoice(note.message)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                >
                  🔊
                </button>
                <button
                  onClick={() => removeOne(note.id)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-lg transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
