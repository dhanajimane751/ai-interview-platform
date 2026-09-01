import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  TrendingUp,
  BriefcaseBusiness,
  MessageSquareText,
  ShieldCheck,
  Eye,
  Monitor,
  Maximize,
  UserRoundX,
  Users,
  Camera,
  Mic,
  Timer,
  Activity,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-base-800 bg-base-950/50 p-4">
      <div className="flex items-center gap-2 text-ink-muted">
        {Icon ? <Icon size={13} /> : null}

        <span className="text-[10px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-base font-semibold">
        {value}
      </p>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  index = 0,
}) {
  const score =
    typeof value === "number"
      ? value
      : Number(value) || 0;

  let barColor = "bg-danger";
  let textColor = "text-danger";

  if (score >= 85) {
    barColor = "bg-mint";
    textColor = "text-mint";
  } else if (score >= 70) {
    barColor = "bg-signal";
    textColor = "text-signal";
  } else if (score >= 50) {
    barColor = "bg-warn";
    textColor = "text-warn";
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 10,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: index * 0.05,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium">
          {label}
        </span>

        <span
          className={`font-mono-data text-xs font-semibold ${textColor}`}
        >
          {score}/100
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-base-800">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${Math.max(
              0,
              Math.min(100, score)
            )}%`,
          }}
          transition={{
            duration: 0.7,
            delay:
              0.1 + index * 0.05,
          }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </motion.div>
  );
}

function InsightCard({
  type,
  title,
  icon: Icon,
  items,
}) {
  const isStrength =
    type === "strength";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      className={`rounded-2xl border p-5 sm:p-6 ${
        isStrength
          ? "border-mint/15 bg-mint/[0.025]"
          : "border-danger/15 bg-danger/[0.025]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isStrength
              ? "bg-mint/10 text-mint"
              : "bg-danger/10 text-danger"
          }`}
        >
          <Icon size={18} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {isStrength
              ? "Positive signals"
              : "Growth opportunities"}
          </p>

          <h3 className="mt-0.5 font-display text-lg font-semibold">
            {title}
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items?.length ? (
          items.map(
            (item, index) => (
              <div
                key={index}
                className="flex gap-3"
              >
                <span
                  className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    isStrength
                      ? "bg-mint"
                      : "bg-danger"
                  }`}
                />

                <p className="text-sm leading-relaxed text-ink-muted">
                  {item}
                </p>
              </div>
            )
          )
        ) : (
          <p className="text-sm text-ink-muted">
            No specific points were
            provided.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ReportPage() {
  const { interviewId } =
    useParams();

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchOrGenerateReport =
    async () => {
      try {
        setLoading(true);
        setError("");

        try {
          const response =
            await axiosInstance.get(
              `/reports/${interviewId}`
            );

          setReport(
            response.data?.report
          );
        } catch {
          const response =
            await axiosInstance.post(
              `/reports/${interviewId}/generate`
            );

          setReport(
            response.data?.report
          );
        }
      } catch (err) {
        console.error(
          "Report loading error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to load report"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (interviewId) {
      fetchOrGenerateReport();
    }
  }, [interviewId]);

  const overallScore =
    Number(
      report?.overallScore
    ) || 0;

  const scoreItems = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        label: "Technical",
        value:
          report.technicalScore ||
          0,
      },
      {
        label: "Communication",
        value:
          report.communicationScore ||
          0,
      },
      {
        label: "Confidence",
        value:
          report.confidenceScore ||
          0,
      },
      {
        label: "Body Language",
        value:
          report.bodyLanguageScore ||
          0,
      },
      {
        label: "Grammar",
        value:
          report.grammarScore ||
          0,
      },
      {
        label: "Voice",
        value:
          report.voiceScore ||
          0,
      },
      {
        label: "Eye Contact",
        value:
          report.eyeContactScore ||
          0,
      },
      {
        label: "Professionalism",
        value:
          report.professionalismScore ||
          0,
      },
      {
        label: "Time Management",
        value:
          report.timeManagementScore ||
          0,
      },
    ];
  }, [report]);

  const radarData = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        subject: "Technical",
        value:
          report.technicalScore || 0,
      },
      {
        subject: "Communication",
        value:
          report.communicationScore ||
          0,
      },
      {
        subject: "Confidence",
        value:
          report.confidenceScore || 0,
      },
      {
        subject: "Grammar",
        value:
          report.grammarScore || 0,
      },
      {
        subject: "Professionalism",
        value:
          report.professionalismScore ||
          0,
      },
      {
        subject: "Time Mgmt",
        value:
          report.timeManagementScore ||
          0,
      },
    ];
  }, [report]);

  const proctoring =
    report?.proctoring || {};

  const proctoringEvents =
    Array.isArray(
      proctoring.events
    )
      ? proctoring.events
      : [];

  const totalProctoringEvents =
    Number(
      proctoring.warnings
    ) || 0;

  const scoreColor = (score) => {
    if (score >= 85) {
      return "text-mint";
    }

    if (score >= 70) {
      return "text-signal";
    }

    if (score >= 50) {
      return "text-warn";
    }

    return "text-danger";
  };

  const scoreBar = (score) => {
    if (score >= 85) {
      return "bg-mint";
    }

    if (score >= 70) {
      return "bg-signal";
    }

    if (score >= 50) {
      return "bg-warn";
    }

    return "bg-danger";
  };

  const getPerformanceLabel =
    (score) => {
      if (score >= 90) {
        return "Exceptional";
      }

      if (score >= 80) {
        return "Strong";
      }

      if (score >= 70) {
        return "Good";
      }

      if (score >= 60) {
        return "Developing";
      }

      return "Needs work";
    };

  const getProctoringColor =
    (status) => {
      if (status === "Clean") {
        return "bg-mint/10 text-mint border-mint/20";
      }

      if (
        status ===
        "Minor Issues"
      ) {
        return "bg-warn/10 text-warn border-warn/20";
      }

      return "bg-danger/10 text-danger border-danger/20";
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-950 px-6 text-ink">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-base-700 bg-base-900">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-base-700 border-t-signal" />
          </div>

          <h2 className="font-display text-xl font-semibold">
            Preparing your report
          </h2>

          <p className="mt-2 text-sm text-ink-muted">
            AI is analyzing your
            interview performance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-950 px-6 text-ink">
        <div className="w-full max-w-md rounded-2xl border border-danger/20 bg-danger/5 p-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
            <AlertTriangle
              size={22}
              className="text-danger"
            />
          </div>

          <h2 className="font-display text-xl font-semibold">
            Unable to load report
          </h2>

          <p className="mt-2 text-sm text-ink-muted">
            {error}
          </p>

          <button
            onClick={
              fetchOrGenerateReport
            }
            className="mt-5 rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-950 text-ink">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-signal/[0.025] blur-[120px]" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-base-800 bg-base-950/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2.5 text-sm text-ink-muted transition hover:text-ink"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-900 transition group-hover:border-base-600">
                <ArrowLeft size={15} />
              </div>

              <span className="hidden sm:inline">
                Back to dashboard
              </span>
            </Link>

            <div className="text-right">
              <p className="font-display text-sm font-semibold">
                Interview Report
              </p>

              <div className="mt-0.5 flex items-center justify-end gap-1.5 text-[10px] text-mint">
                <CheckCircle2 size={11} />
                Analysis complete
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-10">
          <motion.section
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="grid gap-5 lg:grid-cols-[310px_1fr]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-base-700 bg-base-900 p-6">
              <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-signal/[0.05] blur-3xl" />

              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                    Overall score
                  </span>

                  <Target
                    size={17}
                    className="text-signal"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <span className="font-display text-7xl font-bold tracking-tight">
                    {overallScore}
                  </span>

                  <span className="pb-2 text-sm text-ink-muted">
                    / 100
                  </span>
                </div>

                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-base-800">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${overallScore}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.15,
                      }}
                      className={`h-full rounded-full ${scoreBar(
                        overallScore
                      )}`}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] text-ink-muted">
                    <span>0</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-base-800 pt-5">
                  <p
                    className={`text-sm font-semibold ${scoreColor(
                      overallScore
                    )}`}
                  >
                    {getPerformanceLabel(
                      overallScore
                    )}{" "}
                    performance
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Based only on your
                    interview performance,
                    answers, communication,
                    technical ability, and
                    recorded interview
                    behavior.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-base-700 bg-base-900 p-6 sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-signal">
                      Interview assessment
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-semibold">
                    Here's how you performed
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                    Your interview has
                    been evaluated across
                    technical knowledge,
                    communication,
                    confidence,
                    professionalism,
                    grammar, time
                    management, and
                    interview monitoring.
                  </p>
                </div>

                <div className="flex-shrink-0 rounded-xl border border-mint/20 bg-mint/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-ink-muted">
                    Expected rating
                  </p>

                  <p className="mt-1 text-lg font-semibold text-mint">
                    {report.expectedRating ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatCard
                  icon={BriefcaseBusiness}
                  label="Expected rating"
                  value={
                    report.expectedRating ||
                    "—"
                  }
                />

                <StatCard
                  icon={TrendingUp}
                  label="Hiring probability"
                  value={`${report.hiringProbability || 0}%`}
                />

                <StatCard
                  icon={MessageSquareText}
                  label="Communication"
                  value={`${report.communicationScore || 0}/100`}
                />

                <StatCard
                  icon={ShieldCheck}
                  label="Proctoring"
                  value={`${report.proctoringScore || 0}/100`}
                />

                <StatCard
                  icon={Activity}
                  label="Technical"
                  value={`${report.technicalScore || 0}/100`}
                />

                <StatCard
                  icon={Timer}
                  label="Time management"
                  value={`${report.timeManagementScore || 0}/100`}
                />
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.1,
            }}
            className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="rounded-2xl border border-base-700 bg-base-900 p-5 sm:p-6">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Performance overview
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold">
                  Skill profile
                </h2>
              </div>

              <div className="h-[310px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <RadarChart
                    data={radarData}
                    cx="50%"
                    cy="50%"
                    outerRadius="68%"
                  >
                    <PolarGrid
                      stroke="#283044"
                    />

                    <PolarAngleAxis
                      dataKey="subject"
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{
                        fontSize: 9,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                    />

                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-base-700 bg-base-900 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Detailed breakdown
                  </p>

                  <h2 className="mt-1 font-display text-lg font-semibold">
                    Competency scores
                  </h2>
                </div>

                <span className="rounded-full border border-base-700 bg-base-950 px-3 py-1.5 text-[10px] text-ink-muted">
                  {scoreItems.length}{" "}
                  dimensions
                </span>
              </div>

              <div className="space-y-5">
                {scoreItems.map(
                  (item, index) => (
                    <ScoreBar
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                      index={
                        index
                      }
                    />
                  )
                )}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mt-6 rounded-2xl border border-base-700 bg-base-900 p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal">
                  <ShieldCheck
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Interview monitoring
                  </p>

                  <h2 className="mt-1 font-display text-lg font-semibold">
                    Proctoring analysis
                  </h2>

                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                    Review of monitoring
                    events recorded during
                    your interview.
                  </p>
                </div>
              </div>

              <div
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getProctoringColor(
                  report.proctoringStatus
                )}`}
              >
                {report.proctoringStatus ||
                  "Not available"}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <StatCard
                icon={ShieldCheck}
                label="Proctoring score"
                value={`${report.proctoringScore || 0}/100`}
              />

              <StatCard
                icon={Monitor}
                label="Tab switches"
                value={
                  proctoring.tabSwitches ||
                  0
                }
              />

              <StatCard
                icon={Eye}
                label="Window blur"
                value={
                  proctoring.windowBlurs ||
                  0
                }
              />

              <StatCard
                icon={Maximize}
                label="Fullscreen exits"
                value={
                  proctoring.fullscreenExits ||
                  0
                }
              />

              <StatCard
                icon={UserRoundX}
                label="No face"
                value={
                  proctoring.noFaceEvents ||
                  0
                }
              />

              <StatCard
                icon={Users}
                label="Multiple faces"
                value={
                  proctoring.multipleFaceEvents ||
                  0
                }
              />

              <StatCard
                icon={Camera}
                label="Camera errors"
                value={
                  proctoring.cameraErrors ||
                  0
                }
              />

              <StatCard
                icon={Mic}
                label="Microphone errors"
                value={
                  proctoring.microphoneErrors ||
                  0
                }
              />
            </div>

            <div className="mt-5 rounded-xl border border-base-800 bg-base-950/40 p-4">
              <div className="flex items-start gap-3">
                <Activity
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-signal"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Monitoring summary
                  </p>

                  <p className="mt-2 text-sm leading-7 text-ink-muted">
                    {report.proctoringSummary ||
                      "No proctoring summary is available."}
                  </p>
                </div>
              </div>
            </div>

            {totalProctoringEvents >
              0 &&
              proctoringEvents.length >
                0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Recorded events
                    </p>

                    <span className="text-xs text-ink-muted">
                      {
                        proctoringEvents.length
                      }{" "}
                      event
                      {proctoringEvents.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {proctoringEvents.map(
                      (
                        event,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="flex items-start gap-3 rounded-xl border border-base-800 bg-base-950/40 px-3 py-3"
                        >
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warn" />

                          <p className="text-sm leading-relaxed text-ink-muted">
                            {typeof event ===
                            "string"
                              ? event
                              : event?.message ||
                                "Proctoring event recorded."}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {totalProctoringEvents ===
              0 && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-mint/15 bg-mint/[0.025] p-4">
                <CheckCircle2
                  size={18}
                  className="text-mint"
                />

                <p className="text-sm text-ink-muted">
                  No proctoring violations
                  were recorded during
                  this interview.
                </p>
              </div>
            )}
          </motion.section>

          <section className="mt-6 grid gap-5 md:grid-cols-2">
            <InsightCard
              type="strength"
              title="Your strengths"
              icon={CheckCircle2}
              items={
                report.strengths
              }
            />

            <InsightCard
              type="weakness"
              title="Areas to improve"
              icon={AlertTriangle}
              items={
                report.weaknesses
              }
            />
          </section>

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mt-6 rounded-2xl border border-base-700 bg-base-900 p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal">
                <ArrowUpRight
                  size={19}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Next steps
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold">
                  Recommended improvements
                </h2>

                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  Focus on these areas
                  before your next
                  interview.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {report.recommendedImprovements
                ?.length ? (
                report.recommendedImprovements.map(
                  (
                    item,
                    index
                  ) => (
                    <motion.div
                      key={
                        index
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay:
                          index *
                          0.06,
                      }}
                      className="flex gap-3 rounded-xl border border-base-800 bg-base-950/50 p-4"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-signal/10 text-[10px] font-semibold text-signal">
                        {index +
                          1}
                      </span>

                      <p className="text-sm leading-relaxed text-ink-muted">
                        {item}
                      </p>
                    </motion.div>
                  )
                )
              ) : (
                <p className="text-sm text-ink-muted">
                  No specific
                  improvements were
                  generated.
                </p>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="relative mt-6 overflow-hidden rounded-2xl border border-signal/20 bg-signal/[0.035] p-6 sm:p-7"
          >
            <div className="absolute right-[-70px] top-[-70px] h-56 w-56 rounded-full bg-signal/[0.055] blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal">
                <Sparkles
                  size={20}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-signal">
                    AI coach
                  </p>

                  <span className="rounded-full border border-signal/20 bg-signal/5 px-2 py-0.5 text-[9px] text-signal">
                    Interview feedback
                  </span>
                </div>

                <h2 className="mt-1 font-display text-xl font-semibold">
                  Your interview feedback
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-muted">
                  {report.aiSuggestions ||
                    "Keep practicing and use the performance breakdown above to focus your preparation."}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              icon={Activity}
              label="Technical"
              value={`${report.technicalScore || 0}/100`}
            />

            <StatCard
              icon={MessageSquareText}
              label="Communication"
              value={`${report.communicationScore || 0}/100`}
            />

            <StatCard
              icon={TrendingUp}
              label="Confidence"
              value={`${report.confidenceScore || 0}/100`}
            />

            <StatCard
              icon={ShieldCheck}
              label="Professionalism"
              value={`${report.professionalismScore || 0}/100`}
            />
          </motion.section>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-base-800 pt-6 sm:flex-row">
            <div>
              <p className="text-sm font-medium">
                Ready for another
                round?
              </p>

              <p className="mt-1 text-xs text-ink-muted">
                Practice again and
                compare your
                improvement over time.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Back to dashboard
              <ArrowRightIcon />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReportPage;