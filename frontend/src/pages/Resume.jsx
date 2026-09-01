import { useEffect, useRef, useState } from "react";
import {
    Upload,
    FileText,
    Trash2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

function Resume() {
    const inputRef = useRef(null);

    const [resume, setResume] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            const response = await axiosInstance.get(
                "/resumes"
            );

            setResume(response.data.resume);
        } catch (error) {
            console.error(
                "Failed to load resume",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF resumes are supported");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Resume must be under 5MB");
            return;
        }

        setSelectedFile(file);
    };

    const uploadResume = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append(
                "resume",
                selectedFile
            );

            const response =
                await axiosInstance.post(
                    "/resumes/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

            setResume(response.data.resume);
            setSelectedFile(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            toast.success(
                "Resume uploaded successfully"
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to upload resume"
            );
        } finally {
            setUploading(false);
        }
    };

    const deleteResume = async () => {
        try {
            setDeleting(true);

            await axiosInstance.delete("/resumes");

            setResume(null);

            toast.success("Resume removed");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to remove resume"
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen px-4 sm:px-6 py-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <p className="text-xs text-ink-muted uppercase tracking-wider">
                    Interview preparation
                </p>

                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mt-1">
                    Your resume
                </h1>

                <p className="text-sm text-ink-muted mt-2">
                    Upload your resume so MockAI can build interview
                    questions around your actual experience.
                </p>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-7">
                <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-base-700 rounded-xl p-8 sm:p-12">
                    <div className="w-14 h-14 rounded-2xl bg-signal/10 flex items-center justify-center text-signal">
                        <Upload size={24} />
                    </div>

                    <h2 className="font-display text-lg font-semibold text-ink mt-5">
                        Upload your resume
                    </h2>

                    <p className="text-sm text-ink-muted mt-2 max-w-md">
                        PDF only. Maximum file size is 5MB.
                    </p>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            inputRef.current?.click()
                        }
                        className="mt-5 px-5 py-2.5 rounded-xl bg-signal text-white text-sm font-medium hover:opacity-90 transition"
                    >
                        Choose PDF
                    </button>

                    {selectedFile && (
                        <div className="mt-5 w-full max-w-md">
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-base-700 bg-base-900 p-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText
                                        size={18}
                                        className="text-signal shrink-0"
                                    />

                                    <span className="text-sm text-ink truncate">
                                        {selectedFile.name}
                                    </span>
                                </div>

                                <button
                                    onClick={uploadResume}
                                    disabled={uploading}
                                    className="shrink-0 px-4 py-2 rounded-lg bg-signal text-white text-xs font-medium disabled:opacity-50"
                                >
                                    {uploading
                                        ? "Uploading..."
                                        : "Upload"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="mt-5 h-20 rounded-xl bg-base-800 animate-pulse" />
                ) : resume ? (
                    <div className="mt-5 rounded-xl border border-mint/20 bg-mint/5 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2
                                        size={18}
                                        className="text-mint"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink truncate">
                                        {resume.fileName}
                                    </p>

                                    <p className="text-xs text-ink-muted mt-1">
                                        Resume connected to your
                                        interviews
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={deleteResume}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-danger/20 text-danger text-xs hover:bg-danger/10 transition disabled:opacity-50"
                            >
                                <Trash2 size={14} />

                                {deleting
                                    ? "Removing..."
                                    : "Remove"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-warn/20 bg-warn/5 p-4">
                        <AlertCircle
                            size={17}
                            className="text-warn shrink-0 mt-0.5"
                        />

                        <p className="text-xs leading-5 text-ink-muted">
                            You can still take interviews without a
                            resume, but resume-based interviews will be
                            more personalized.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Resume;