"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/dashboard/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0FA3A8] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0FA3A8] to-[#0D8B8F] px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {profile.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name || "User"}</h1>
              <p className="text-white/80 text-sm">{profile.role || "Admin"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Informasi Akun
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-[#0FA3A8]" />
              <div>
                <p className="text-xs text-gray-500">Nama Lengkap</p>
                <p className="font-medium text-gray-800">{profile.name || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-[#0FA3A8]" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{profile.email || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-[#0FA3A8]" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-800">
                  <span className="inline-block px-2 py-0.5 bg-[#0FA3A8]/10 text-[#0FA3A8] rounded-full text-xs">
                    {profile.role || "Admin"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-xs text-gray-400">
              Terakhir login: {new Date().toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
