"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        window.location.href = "/";
        return;
      }

      setCurrentUserId(user.id);
    };

    fetchUser();
  }, []);

  // Fetch bookmarks for logged-in user
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load bookmarks:", error.message);
      return;
    }

    setBookmarks(data ?? []);
  };

  // Load data + subscribe to realtime updates
  useEffect(() => {
    if (!currentUserId) return;

    const init = async () => {
      await fetchBookmarks(currentUserId);
      setLoading(false);
    };

    init();

    const channel = supabase
      .channel("bookmark-live-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const changedUserId =
            (payload.new as { user_id?: string })?.user_id || (payload.old as { user_id?: string })?.user_id;

          if (changedUserId === currentUserId) {
            fetchBookmarks(currentUserId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Add bookmark
  const addBookmark = async () => {
    if (!formTitle.trim() || !formUrl.trim() || !currentUserId) return;

    setAdding(true);

    const { error } = await supabase.from("bookmarks").insert({
      title: formTitle.trim(),
      url: formUrl.trim(),
      user_id: currentUserId,
    });

    if (error) {
      console.error("Unable to add bookmark:", error.message);
      setAdding(false);
      return;
    }

    setFormTitle("");
    setFormUrl("");
    setAdding(false);
  };

  // 🗑 Soft delete bookmark
  const deleteBookmark = async (id: string) => {
    if (!currentUserId) return;

    setRemovingId(id);

    const { error } = await supabase
      .from("bookmarks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Failed to delete bookmark:", error.message);
    }

    setRemovingId(null);
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Bookmarks</h1>
        <button onClick={logout} className="text-sm text-red-500 hover:text-red-600">
          Logout
        </button>
      </div>

      {/* Add Bookmark Form */}
      <div className="space-y-3 mb-8">
        <input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Bookmark title"
          disabled={adding}
          className="w-full border p-2 rounded focus:outline-none focus:border-black"
        />

        <input
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={adding}
          className="w-full border p-2 rounded focus:outline-none focus:border-black"
        />

        <button
          onClick={addBookmark}
          disabled={adding || !formTitle.trim() || !formUrl.trim()}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {adding ? "Adding..." : "Add Bookmark"}
        </button>
      </div>

      {/* Bookmark List */}
      <div className="space-y-3">
        {bookmarks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No bookmarks added yet. Start by adding one above.</p>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex justify-between items-center border p-3 rounded hover:border-gray-400 transition"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {bookmark.title}
              </a>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                disabled={removingId === bookmark.id}
                className="text-sm text-red-500 hover:text-red-600 disabled:text-red-300 disabled:cursor-not-allowed"
              >
                {removingId === bookmark.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
