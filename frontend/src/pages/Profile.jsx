import { useEffect, useRef, useState } from "react";
import { Camera, Mail, User, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import axiosInstance from "../api/axiosInstance";
import { updateUser } from "../redux/slices/authSlice";

function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    const fileInputRef = useRef(null);

    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(user?.name || "");
        setAvatar(user?.avatar || "");
    }, [user]);

    const initial = (user?.email?.[0] || "U").toUpperCase();

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Only JPG, PNG or WEBP images are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        setSelectedFile(file);
        setAvatar(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", name.trim());

            if (selectedFile) {
                formData.append("avatar", selectedFile);
            }

            const response = await axiosInstance.put(
                "/profile",
                formData
            );

            dispatch(updateUser(response.data.user));

            setAvatar(response.data.user.avatar || "");
            setSelectedFile(null);

            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition mb-6"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                        Profile
                    </h1>

                    <p className="text-sm sm:text-base text-ink-muted mt-1">
                        Manage your personal information and profile photo.
                    </p>
                </div>

                {/* Profile Hero */}
                <div className="card rounded-2xl overflow-hidden mb-5">
                    <div className="h-28 sm:h-36 bg-gradient-to-r from-signal/20 via-signal/5 to-transparent" />

                    <div className="px-5 sm:px-8 pb-7">
                        <div className="-mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-5">

                            {/* Avatar */}
                            <div className="relative self-center sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="group relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-base-900 bg-base-800 shadow-xl"
                                >
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={user?.name || "Profile"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-semibold text-ink bg-base-800">
                                            {initial}
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                                        <Camera
                                            size={22}
                                            className="text-white"
                                        />
                                        <span className="text-[11px] text-white">
                                            Change
                                        </span>
                                    </div>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* User info */}
                            <div className="flex-1 text-center sm:text-left pb-1">
                                <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                                    {user?.name || "User"}
                                </h2>

                                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-ink-muted mt-1">
                                    <Mail size={14} />
                                    <span className="break-all">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center sm:justify-start mt-5">
                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="inline-flex items-center gap-2 text-sm font-medium text-signal hover:opacity-80 transition"
                            >
                                <Camera size={16} />
                                Change profile photo
                            </button>
                        </div>

                        <p className="text-xs text-ink-muted mt-2 text-center sm:text-left">
                            JPG, PNG or WEBP · Maximum 5MB
                        </p>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="card rounded-2xl p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-signal/10 flex items-center justify-center">
                            <User
                                size={18}
                                className="text-signal"
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                                Personal information
                            </h2>

                            <p className="text-xs sm:text-sm text-ink-muted">
                                Update the information shown on your profile.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">

                        {/* Name */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-ink mb-2">
                                Full name
                            </label>

                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                                />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter your name"
                                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-base-800 border border-base-700 text-sm text-ink outline-none focus:border-signal transition"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-ink mb-2">
                                Email address
                            </label>

                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                                />

                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-base-800/60 border border-base-700 text-sm text-ink-muted outline-none cursor-not-allowed"
                                />
                            </div>

                            <p className="text-xs text-ink-muted mt-2">
                                Email address cannot be changed.
                            </p>
                        </div>

                        {/* Save */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-lg bg-signal text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Check size={16} />

                                {saving
                                    ? "Saving..."
                                    : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;