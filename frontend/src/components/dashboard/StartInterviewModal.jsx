import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";

import {
    Upload,
    FileText,
    X,
    CheckCircle2,
} from "lucide-react";

function StartInterviewModal({
    onClose,
    onStart,
}) {
    const [companies, setCompanies] =
        useState([]);

    const [
        selectedCompany,
        setSelectedCompany,
    ] = useState(null);

    const [role, setRole] = useState(
        "Software Engineer"
    );

    const [
        difficulty,
        setDifficulty,
    ] = useState("Medium");

    const [
        selectedFile,
        setSelectedFile,
    ] = useState(null);

    const [loading, setLoading] =
        useState(false);

    const [fetching, setFetching] =
        useState(true);

    const fileInputRef =
        useRef(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies =
        async () => {
            try {
                const response =
                    await axiosInstance.get(
                        "/companies"
                    );

                setCompanies(
                    response.data
                        .companies || []
                );
            } catch (error) {
                console.error(
                    "Failed to load companies:",
                    error
                );
            } finally {
                setFetching(false);
            }
        };

    const handleFileChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        if (
            file.type !==
            "application/pdf"
        ) {
            alert(
                "Only PDF resumes are supported."
            );

            event.target.value = "";
            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            alert(
                "Resume must be under 5MB."
            );

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value =
                "";
        }
    };

    const handleStart = async () => {
        if (!role.trim()) {
            return;
        }

        try {
            setLoading(true);

            const formData =
                new FormData();

            formData.append(
                "role",
                role.trim()
            );

            formData.append(
                "difficulty",
                difficulty
            );

            formData.append(
                "interviewType",
                "Mixed"
            );

            if (selectedCompany?._id) {
                formData.append(
                    "companyId",
                    selectedCompany._id
                );
            }

            /*
             * Resume is optional.
             */
            if (selectedFile) {
                formData.append(
                    "resume",
                    selectedFile
                );
            }

            await onStart(formData);
        } catch (error) {
            console.error(
                "Start interview error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-base-950/80 backdrop-blur-sm flex items-center justify-center px-4 py-6 overflow-y-auto">
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.97,
                    y: 10,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                className="glass-card rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-card my-auto"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="font-display text-xl font-bold text-ink">
                            Set up your interview
                        </h2>

                        <p className="text-ink-muted text-sm mt-1">
                            Choose your role and optionally upload your resume.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-base-800 transition"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Role */}
                <label className="text-xs text-ink-muted block mb-1.5">
                    Target role
                </label>

                <input
                    type="text"
                    value={role}
                    onChange={(event) =>
                        setRole(
                            event.target
                                .value
                        )
                    }
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-base-900 border border-base-600 rounded-lg px-4 py-2.5 mb-4 text-sm text-ink focus:outline-none focus:border-signal transition"
                />

                {/* Difficulty */}
                <label className="text-xs text-ink-muted block mb-1.5">
                    Difficulty
                </label>

                <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                        "Easy",
                        "Medium",
                        "Hard",
                    ].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() =>
                                setDifficulty(
                                    level
                                )
                            }
                            className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                                difficulty ===
                                level
                                    ? "btn-gradient text-white border-transparent"
                                    : "border-base-600 text-ink-muted hover:border-base-500 hover:text-ink"
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {/* Resume */}
                <div className="mb-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <label className="text-xs text-ink-muted">
                            Resume
                        </label>

                        <span className="text-[10px] text-ink-muted">
                            Optional · PDF · 5MB max
                        </span>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={
                            handleFileChange
                        }
                        className="hidden"
                    />

                    {!selectedFile ? (
                        <button
                            type="button"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="w-full border border-dashed border-base-600 hover:border-signal/60 rounded-xl p-4 text-left transition bg-base-900/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-base-800 flex items-center justify-center text-ink-muted shrink-0">
                                    <Upload size={17} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">
                                        Upload resume
                                    </p>

                                    <p className="text-xs text-ink-muted mt-0.5 leading-5">
                                        Resume-based questions will be added to your interview.
                                    </p>
                                </div>
                            </div>
                        </button>
                    ) : (
                        <div className="w-full rounded-xl border border-signal/25 bg-signal/5 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-signal/10 flex items-center justify-center text-signal shrink-0">
                                    <FileText size={17} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-ink truncate">
                                        {selectedFile.name}
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle2
                                            size={12}
                                            className="text-mint"
                                        />

                                        <span className="text-[11px] text-ink-muted">
                                            Resume ready
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        removeFile
                                    }
                                    className="w-8 h-8 rounded-lg text-ink-muted hover:text-danger hover:bg-danger/10 flex items-center justify-center transition"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-[11px] text-ink-muted mt-2 leading-5">
                        Resume is optional. Without one, MockAI will use your job role and core subjects such as OOPS, DBMS/SQL, CN, and DSA.
                    </p>
                </div>

                {/* Company */}
                <label className="text-xs text-ink-muted block mb-2">
                    Company style
                </label>

                {fetching ? (
                    <p className="text-ink-muted text-sm mb-5">
                        Loading companies...
                    </p>
                ) : companies.length ===
                  0 ? (
                    <p className="text-ink-muted text-sm mb-5">
                        No company styles available.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-2.5 mb-6 max-h-40 overflow-y-auto pr-1">
                        {companies.map(
                            (company) => (
                                <button
                                    key={
                                        company._id
                                    }
                                    type="button"
                                    onClick={() =>
                                        setSelectedCompany(
                                            company
                                        )
                                    }
                                    className={`text-left p-3 rounded-lg border transition ${
                                        selectedCompany?._id ===
                                        company._id
                                            ? "border-signal bg-signal/10"
                                            : "border-base-600 hover:border-base-500"
                                    }`}
                                >
                                    <p className="font-medium text-sm text-ink">
                                        {
                                            company.name
                                        }
                                    </p>

                                    <p className="text-ink-muted text-xs mt-0.5">
                                        {
                                            company.difficultyLevel
                                        }
                                    </p>
                                </button>
                            )
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 border border-base-600 hover:border-base-500 transition py-2.5 rounded-lg text-sm text-ink"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={
                            loading ||
                            !role.trim()
                        }
                        className="flex-1 btn-gradient text-white py-2.5 rounded-lg font-medium disabled:opacity-50 shadow-glow text-sm"
                    >
                        {loading
                            ? "Preparing..."
                            : "Start Interview"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default StartInterviewModal;