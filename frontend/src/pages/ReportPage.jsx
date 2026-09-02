import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  ArrowLeft,
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

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-stone-300 bg-[#fffdf8] p-4">
      <div className="flex items-center gap-2 text-stone-500">
        {Icon ? <Icon size={13} /> : null}

        <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-2 font-mono text-sm font-semibold text-stone-900">
        {value}
      </p>
    </div>
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
    <div className="border border-stone-300 bg-[#fffdf8] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center border border-stone-300">
          <Icon
            size={17}
            className={
              isStrength
                ? "text-emerald-700"
                : "text-amber-700"
            }
          />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {isStrength
              ? "Strengths"
              : "Areas to improve"}
          </p>

          <h3 className="mt-0.5 font-serif text-lg font-bold text-stone-900">
            {title}
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items?.length ? (
          items.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 border-b border-dashed border-stone-300 pb-3 last:border-b-0 last:pb-0"
            >
              <span className="mt-2 font-mono text-[10px] text-stone-500">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <p className="text-sm leading-6 text-stone-700">
                {item}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-500">
            No specific points were provided.
          </p>
        )}
      </div>
    </div>
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

  const [interview, setInterview] =
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

        let reportData = null;

        try {
          const response =
            await axiosInstance.get(
              `/reports/${interviewId}`
            );

          reportData =
            response.data?.report;
        } catch {
          const response =
            await axiosInstance.post(
              `/reports/${interviewId}/generate`
            );

          reportData =
            response.data?.report;
        }

        setReport(reportData);

        try {
          const interviewResponse =
            await axiosInstance.get(
              `/interviews/${interviewId}`
            );

          setInterview(
            interviewResponse.data?.interview ||
              null
          );
        } catch (interviewError) {
          console.error(
            "Interview loading error:",
            interviewError
          );
        }
      } catch (err) {
        console.error(
          "Report loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
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
    Number(report?.overallScore) || 0;

  const proctoring =
    interview?.proctoring ||
    report?.proctoring ||
    {};

  const getCount = (
    interviewValue,
    reportValue
  ) => {
    const interviewNumber =
      Number(interviewValue);

    const reportNumber =
      Number(reportValue);

    if (
      Number.isFinite(
        interviewNumber
      )
    ) {
      return interviewNumber;
    }

    if (
      Number.isFinite(
        reportNumber
      )
    ) {
      return reportNumber;
    }

    return 0;
  };

  const tabSwitches =
    getCount(
      proctoring.tabSwitches,
      report?.proctoring?.tabSwitches
    );

  const windowBlurs =
    getCount(
      proctoring.windowBlurs,
      report?.proctoring?.windowBlurs
    );

  const fullscreenExits =
    getCount(
      proctoring.fullscreenExits,
      report?.proctoring?.fullscreenExits
    );

  const noFaceEvents =
    getCount(
      proctoring.noFaceEvents,
      report?.proctoring?.noFaceEvents
    );

  const multipleFaceEvents =
    getCount(
      proctoring.multipleFaceEvents,
      report?.proctoring
        ?.multipleFaceEvents
    );

  const cameraErrors =
    getCount(
      proctoring.cameraErrors,
      report?.proctoring?.cameraErrors
    );

  const microphoneErrors =
    getCount(
      proctoring.microphoneErrors,
      report?.proctoring
        ?.microphoneErrors
    );

  const warnings =
    getCount(
      proctoring.warnings,
      report?.proctoring?.warnings
    );

  const totalProctoringEvents =
    tabSwitches +
    windowBlurs +
    fullscreenExits +
    noFaceEvents +
    multipleFaceEvents +
    cameraErrors +
    microphoneErrors;

  const radarData = [
    {
      subject: "Technical",
      value:
        report?.technicalScore || 0,
    },
    {
      subject: "Communication",
      value:
        report?.communicationScore ||
        0,
    },
    {
      subject: "Confidence",
      value:
        report?.confidenceScore || 0,
    },
    {
      subject: "Grammar",
      value:
        report?.grammarScore || 0,
    },
    {
      subject: "Professionalism",
      value:
        report?.professionalismScore ||
        0,
    },
    {
      subject: "Time Mgmt",
      value:
        report?.timeManagementScore ||
        0,
    },
  ];

  const scoreColor = (score) => {
    if (score >= 85) {
      return "text-emerald-700";
    }

    if (score >= 70) {
      return "text-blue-700";
    }

    if (score >= 50) {
      return "text-amber-700";
    }

    return "text-red-700";
  };

  const scoreBar = (score) => {
    if (score >= 85) {
      return "bg-emerald-700";
    }

    if (score >= 70) {
      return "bg-blue-700";
    }

    if (score >= 50) {
      return "bg-amber-700";
    }

    return "bg-red-700";
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
        return "border-emerald-300 bg-emerald-50 text-emerald-700";
      }

      if (
        status ===
        "Minor Issues"
      ) {
        return "border-amber-300 bg-amber-50 text-amber-700";
      }

      return "border-red-300 bg-red-50 text-red-700";
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6 text-stone-900">
        <div className="w-full max-w-md border border-stone-300 bg-[#fffdf8] p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500">
            AI Mock Interview
          </p>

          <h2 className="mt-4 font-serif text-2xl font-bold">
            Preparing your report
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            AI is analyzing your interview performance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6 text-stone-900">
        <div className="w-full max-w-md border border-red-300 bg-[#fffdf8] p-7 text-center">
          <AlertTriangle
            size={22}
            className="mx-auto text-red-700"
          />

          <h2 className="mt-4 font-serif text-xl font-bold">
            Unable to load report
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            {error}
          </p>

          <button
            onClick={
              fetchOrGenerateReport
            }
            className="mt-5 border border-stone-800 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
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
    <>
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .report-no-print {
              display: none !important;
            }

            .report-paper {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              border: 0 !important;
              box-shadow: none !important;
            }

            .report-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            @page {
              size: A4;
              margin: 14mm;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-stone-100 text-stone-900">
        <div className="report-no-print mx-auto flex max-w-[1000px] items-center justify-between px-5 py-5 sm:px-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="flex items-center gap-2 border border-stone-400 bg-[#fffdf8] px-4 py-2 text-sm font-medium hover:bg-white"
          >
            Print / Save PDF
          </button>
        </div>

        <main className="mx-auto max-w-[1000px] px-3 pb-10 sm:px-5">
          <div className="report-paper border border-stone-300 bg-[#fffdf8] shadow-[0_5px_25px_rgba(0,0,0,0.07)]">
            <div className="p-6 sm:p-10">
              <header className="report-section border-b-2 border-stone-900 pb-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">
                      AI Mock Interview
                    </p>

                    <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
                      Interview Report
                    </h1>

                    <p className="mt-2 text-sm text-stone-600">
                      Interview performance evaluation
                    </p>
                  </div>

                  <div className="border border-stone-400 px-5 py-4 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500">
                      Overall score
                    </p>

                    <p
                      className={`mt-1 font-serif text-4xl font-bold ${scoreColor(
                        overallScore
                      )}`}
                    >
                      {overallScore}
                    </p>

                    <p className="font-mono text-xs text-stone-500">
                      / 100
                    </p>
                  </div>
                </div>
              </header>

              <section className="report-section grid gap-5 border-b border-stone-300 py-7 lg:grid-cols-[300px_1fr]">
                <div className="border border-stone-300 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                      Overall score
                    </span>

                    <Target
                      size={17}
                      className="text-stone-700"
                    />
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-serif text-6xl font-bold">
                      {overallScore}
                    </span>

                    <span className="pb-2 font-mono text-sm text-stone-500">
                      / 100
                    </span>
                  </div>

                  <div className="mt-5 h-2 bg-stone-200">
                    <div
                      className={`h-full ${scoreBar(
                        overallScore
                      )}`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            overallScore
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-5 border-t border-stone-300 pt-5">
                    <p
                      className={`text-sm font-bold ${scoreColor(
                        overallScore
                      )}`}
                    >
                      {getPerformanceLabel(
                        overallScore
                      )}{" "}
                      performance
                    </p>

                    <p className="mt-2 text-xs leading-6 text-stone-600">
                      Based on your interview answers,
                      communication, technical
                      performance, and available
                      interview measurements.
                    </p>
                  </div>
                </div>

                <div className="border border-stone-300 p-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                      Interview assessment
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-bold">
                      Here's how you performed
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
                      Your interview has been evaluated
                      across technical knowledge,
                      communication, confidence,
                      professionalism, grammar,
                      time management, and interview
                      monitoring.
                    </p>
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
              </section>

              <section className="report-section border-b border-stone-300 py-7">
                <div className="border border-stone-300 bg-[#fffdf8] p-5 sm:p-6">
                  <div className="mb-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                      Performance overview
                    </p>

                    <h2 className="mt-1 font-serif text-lg font-bold">
                      Skill profile
                    </h2>
                  </div>

                  <div className="space-y-4 pt-2">
                    {radarData.map(
                      (item) => (
                        <div
                          key={item.subject}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-stone-600">
                              {
                                item.subject
                              }
                            </span>

                            <span className="font-mono text-xs font-semibold">
                              {item.value}/100
                            </span>
                          </div>

                          <div className="h-1.5 bg-stone-200">
                            <div
                              className={`h-full ${scoreBar(
                                item.value
                              )}`}
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    item.value
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>

              <section className="report-section border-b border-stone-300 py-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-stone-300">
                      <ShieldCheck
                        size={18}
                        className="text-stone-700"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                        Interview monitoring
                      </p>

                      <h2 className="mt-1 font-serif text-lg font-bold">
                        Proctoring analysis
                      </h2>

                      <p className="mt-1.5 text-xs leading-5 text-stone-600">
                        Monitoring counts recorded
                        during your interview.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`border px-3 py-1.5 text-xs font-semibold ${getProctoringColor(
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
                    value={tabSwitches}
                  />

                  <StatCard
                    icon={Eye}
                    label="Window blur"
                    value={windowBlurs}
                  />

                  <StatCard
                    icon={Maximize}
                    label="Fullscreen exits"
                    value={fullscreenExits}
                  />

                  <StatCard
                    icon={UserRoundX}
                    label="No face"
                    value={noFaceEvents}
                  />

                  <StatCard
                    icon={Users}
                    label="Multiple faces"
                    value={multipleFaceEvents}
                  />

                  <StatCard
                    icon={Camera}
                    label="Camera errors"
                    value={cameraErrors}
                  />

                  <StatCard
                    icon={Mic}
                    label="Microphone errors"
                    value={microphoneErrors}
                  />
                </div>

                <div className="mt-5 border border-stone-300 bg-stone-50 p-4">
                  <div className="flex items-start gap-3">
                    <Activity
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-stone-700"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                        Monitoring summary
                      </p>

                      <p className="mt-2 text-sm leading-6 text-stone-700">
                        {report.proctoringSummary ||
                          (totalProctoringEvents > 0
                            ? `${totalProctoringEvents} proctoring event${
                                totalProctoringEvents ===
                                1
                                  ? ""
                                  : "s"
                              } were recorded during the interview.`
                            : "No proctoring events were recorded during the interview.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-stone-500">
                  Total recorded monitoring events:{" "}
                  <span className="font-mono font-semibold text-stone-800">
                    {totalProctoringEvents}
                  </span>
                </div>

                {warnings > 0 &&
                totalProctoringEvents === 0 ? (
                  <div className="mt-2 text-xs text-stone-500">
                    Recorded warnings:{" "}
                    <span className="font-mono font-semibold text-stone-800">
                      {warnings}
                    </span>
                  </div>
                ) : null}
              </section>

              <section className="report-section grid gap-5 border-b border-stone-300 py-7 md:grid-cols-2">
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

              <section className="report-section border-b border-stone-300 py-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-stone-300">
                    <ArrowRightIcon />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                      Next steps
                    </p>

                    <h2 className="mt-1 font-serif text-lg font-bold">
                      Recommended improvements
                    </h2>

                    <p className="mt-1.5 text-xs leading-5 text-stone-600">
                      Focus on these areas before
                      your next interview.
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
                        <div
                          key={index}
                          className="flex gap-3 border border-stone-300 p-4"
                        >
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-stone-300 font-mono text-[10px] font-semibold">
                            {index + 1}
                          </span>

                          <p className="text-sm leading-6 text-stone-700">
                            {item}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-stone-500">
                      No specific improvements were
                      generated.
                    </p>
                  )}
                </div>
              </section>

              <section className="report-section border-b border-stone-300 py-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-stone-300">
                    <Sparkles
                      size={18}
                      className="text-stone-700"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                      AI coach
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-bold">
                      Your interview feedback
                    </h2>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-700">
                      {report.aiSuggestions ||
                        "Keep practicing and use the performance breakdown above to focus your preparation."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="report-section grid gap-3 border-b border-stone-300 py-7 sm:grid-cols-2 lg:grid-cols-4">
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
              </section>

              <div className="report-no-print mt-7 flex flex-col items-center justify-between gap-4 border-t-2 border-stone-900 pt-6 sm:flex-row">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Ready for another round?
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Practice again and compare your
                    improvement over time.
                  </p>
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 border border-stone-800 bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
                >
                  Back to dashboard
                  <ArrowRightIcon />
                </Link>
              </div>

              <footer className="pt-7 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">
                  AI Mock Interview Platform
                </p>

                <p className="mt-2 text-xs text-stone-400">
                  Interview evaluation report
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default ReportPage;