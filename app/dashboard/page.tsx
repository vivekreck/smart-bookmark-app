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
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      } else {
        // Redirect to login if not authenticated
        window.location.href = "/";
      }
    };

    checkAuth();
  }, []);

  // Fetch user's bookmarks from database
  const getBookmarks = async (uid: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return;
    }

    setBookmarks(data || []);
  };

  // Load bookmarks and set up real-time updates
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      await getBookmarks(userId);
      setIsLoading(false);
    };

    loadData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          // Handle INSERT & UPDATE
          if (
            payload.new &&
            (
              payload.new as {
                user_id: string;
              }
            ).user_id === userId
          ) {
            getBookmarks(userId);
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Add a new bookmark
  const handleAddBookmark = async () => {
    if (!title.trim() || !url.trim() || !userId) return;

    setIsAdding(true);

    const { error } = await supabase.from("bookmarks").insert({
      title: title.trim(),
      url: url.trim(),
      user_id: userId,
    });

    if (error) {
      console.error("Error adding bookmark:", error);
      setIsAdding(false);
      return;
    }

    // Clear form
    setTitle("");
    setUrl("");
    setIsAdding(false);
  };

  // Remove a bookmark
  const handleDeleteBookmark = async (id: string) => {
    if (!userId) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("bookmarks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting bookmark:", error);
    }

    setDeletingId(null);
  };

  // Sign out user
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-6 flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading your bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 cursor-pointer">
          Logout
        </button>
      </div>

      {/* Add new bookmark form */}
      <div className="space-y-3 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bookmark title"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-black"
          disabled={isAdding}
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-black"
          disabled={isAdding}
        />
        <button
          onClick={handleAddBookmark}
          disabled={isAdding || !title.trim() || !url.trim()}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {isAdding ? "Adding..." : "Add Bookmark"}
        </button>
      </div>

      {/* List of bookmarks */}
      <div className="space-y-3">
        {bookmarks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No bookmarks yet. Add your first one above!</p>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex justify-between items-center border border-gray-200 p-3 rounded hover:border-gray-300 transition-colors"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                {bookmark.title}
              </a>
              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="text-red-500 hover:text-red-600 text-sm cursor-pointer disabled:text-red-300 disabled:cursor-not-allowed"
              >
                {deletingId === bookmark.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
