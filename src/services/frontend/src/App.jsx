import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const KPI_FIELDS = [
  {
    key: "revenue",
    title: "Revenue",
    description: "Total company revenue",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    key: "net_income",
    title: "Net Income",
    description: "Net profitability after expenses",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    key: "operating_income",
    title: "Operating Income",
    description: "Earnings from operations",
    icon: "M21 13.255A9.001 9.001 0 1111.75 3v9.25H21z M14.75 3.245A8.968 8.968 0 0120.755 9.25H14.75V3.245z",
  },
  {
    key: "cash_flow",
    title: "Operating Cash Flow",
    description: "Cash flow from operations",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    key: "total_assets",
    title: "Total Assets",
    description: "Total economic resources",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    key: "total_liabilities",
    title: "Total Liabilities",
    description: "Total outstanding obligations",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
  },
];

const COLORS = [
  "var(--accent-blue)",
  "var(--accent-green)",
  "var(--accent-amber)",
  "var(--accent-purple)",
  "#06b6d4",
  "var(--accent-red)",
];

function recordKey(record) {
  return `${record.company ?? ""}::${record.year ?? ""}`;
}

function listItems(value) {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function metricNumber(value) {
  if (value == null || value === "") return 0;
  const text = String(value).trim();
  const negative = text.startsWith("(") && text.endsWith(")");
  const number = Number.parseFloat(text.replace(/[$,()\s]/g, ""));
  return Number.isFinite(number) ? (negative ? -number : number) : 0;
}

function Icon({ path, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function App() {
  const [metrics, setMetrics] = useState([]);
  const [metricsState, setMetricsState] = useState("loading");
  const [metricsError, setMetricsError] = useState("");
  const [selectedRecordKey, setSelectedRecordKey] = useState("");
  const [upload, setUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [chatCompanyKey, setChatCompanyKey] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm your AI Financial Analyst. Ask me about ingested company reports, revenue trends, risk analysis, or growth drivers.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);
  const messagesRef = useRef(null);

  const loadMetrics = useCallback(async () => {
    setMetricsState("loading");
    setMetricsError("");
    try {
      const response = await fetch("/api/metrics");
      if (!response.ok) {
        throw new Error(`Metrics service returned ${response.status}`);
      }
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Metrics service returned an unexpected response");
      }
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Metrics service returned invalid JSON");
      }
      if (!Array.isArray(data)) {
        throw new Error("Metrics service returned an unexpected response");
      }
      setMetrics(data);
      setSelectedRecordKey((current) =>
        data.some((row) => recordKey(row) === current)
          ? current
          : data.length
            ? recordKey(data[0])
            : "",
      );
      setMetricsState("ready");
    } catch (error) {
      setMetricsError(
        error instanceof Error && error.message.startsWith("Metrics service returned")
          ? `${error.message}. Please retry.`
          : "Metrics service is temporarily unavailable. Please retry.",
      );
      setMetricsState("error");
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const selectedRecord = useMemo(
    () => metrics.find((row) => recordKey(row) === selectedRecordKey),
    [metrics, selectedRecordKey],
  );

  const uniqueCompanies = useMemo(
    () => new Set(metrics.map((row) => row.company).filter(Boolean)).size,
    [metrics],
  );

  const showToast = (title, message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const uploadFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Invalid File Type", "Please upload a PDF financial report.", "error");
      return;
    }

    setIsUploading(true);
    setUpload({ progress: 0, status: "Uploading report..." });

    const formData = new FormData();
    formData.append("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUpload({
          progress: Math.min(45, Math.round((event.loaded / event.total) * 45)),
          status: "Uploading report...",
        });
      }
    };
    request.onload = async () => {
      if (request.status >= 200 && request.status < 300) {
        setUpload({ progress: 100, status: "Ingestion complete" });
        showToast("Ingestion Complete", "Your report was processed successfully.");
        await loadMetrics();
        window.setTimeout(() => setUpload(null), 1600);
      } else {
        let detail = `Ingestion service returned ${request.status}`;
        try {
          const response = JSON.parse(request.responseText);
          detail = response.detail || response.message || detail;
        } catch {
          // Keep the HTTP status message when the service response is not JSON.
        }
        setUpload({ progress: 0, status: "Upload failed", error: true });
        showToast("Ingestion Failed", detail, "error");
      }
      setIsUploading(false);
    };
    request.onerror = () => {
      setUpload({ progress: 0, status: "Connection failed", error: true });
      setIsUploading(false);
      showToast("Connection Error", "Could not reach the ingestion service.", "error");
    };
    request.send(formData);
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = question.trim();
    if (!text || isSending) return;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text }]);
    setIsSending(true);

    const selectedCompany = metrics.find(
      (row) => recordKey(row) === chatCompanyKey,
    );
    const payload = { question: text };
    if (selectedCompany?.company) payload.company = selectedCompany.company;
    if (selectedCompany?.year) {
      const year = Number.parseInt(selectedCompany.year, 10);
      if (Number.isFinite(year)) payload.year = year;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Chat service returned ${response.status}`);
      }
      setMessages((current) => [
        ...current,
        { role: "bot", text: data.answer || "No response received." },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "bot", text: `Unable to get an answer: ${error.message}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const updateChatCompany = (value) => setChatCompanyKey(value);

  return (
    <>
      <div className={`dashboard-wrapper${chatCollapsed ? " chat-collapsed" : ""}`}>
        <aside className="sidebar">
          <div className="logo-section">
            <div className="logo-icon">
              <Icon path="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </div>
            <span className="logo-text">InvestIQ</span>
          </div>

          <div
            className="uploader-card"
            role="button"
            tabIndex={0}
            aria-disabled={isUploading}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (!isUploading && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.currentTarget.classList.add("dragover");
            }}
            onDragLeave={(event) => event.currentTarget.classList.remove("dragover")}
            onDrop={(event) => {
              event.preventDefault();
              event.currentTarget.classList.remove("dragover");
              if (!isUploading) uploadFile(event.dataTransfer.files[0]);
            }}
          >
            <div className="uploader-icon">
              <Icon path="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </div>
            <div className="uploader-title">Ingest Report</div>
            <div className="uploader-desc">Drag &amp; drop or browse PDF</div>
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept=".pdf,application/pdf"
              aria-label="Choose a PDF financial report"
              disabled={isUploading}
              onChange={(event) => {
                uploadFile(event.target.files[0]);
                event.target.value = "";
              }}
            />
          </div>

          {upload && (
            <div className="progress-container visible" aria-live="polite">
              <div className="progress-header">
                <span className={upload.error ? "progress-status-error" : ""}>
                  {upload.status}
                </span>
                <span>{upload.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="yt-card">
            <div className="yt-header">
              <div className="yt-icon">
                <Icon path="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </div>
              <div className="yt-meta">
                <span className="yt-channel-name">AaiTech</span>
                <span className="yt-badge">Sandesh Hase</span>
              </div>
            </div>
            <div className="yt-body">
              <p>Support our channel! Drop a like and subscribe for more deep-dive AI coding tutorials.</p>
              <div className="yt-actions">
                <button
                  className="yt-action-item"
                  type="button"
                  onClick={() => showToast("Liked!", "Thank you for liking this demo!")}
                >
                  <Icon className="yt-action-icon" path="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                  <span>Like</span>
                </button>
                <button
                  className="yt-action-item active"
                  type="button"
                  onClick={() => showToast("Subscribed!", "Welcome to AaiTech channel!")}
                >
                  <Icon className="yt-action-icon" path="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  <span>Subscribe</span>
                </button>
              </div>
            </div>
          </div>

          <div className="stats-summary">
            <div className="stat-row">
              <span className="stat-label">Companies</span>
              <span className="stat-val">{uniqueCompanies}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Reports Analyzed</span>
              <span className="stat-val">{metrics.length}</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="header-container">
            <div className="header-title-section">
              <h1>AI-Powered Investor Intelligence Platform</h1>
              <p>Real-time corporate insights and KPI extraction</p>
            </div>
          </header>

          {metricsState === "loading" && (
            <p className="app-status" role="status">Loading financial metrics...</p>
          )}
          {metricsState === "error" && metrics.length > 0 && (
            <p className="metrics-load-warning" role="status">
              {metricsError}
              <button type="button" onClick={loadMetrics}>Retry</button>
            </p>
          )}
          {(metricsState === "ready" || metricsState === "error") && metrics.length > 0 && (
            <>
              <section className="kpi-grid" aria-label="Financial metrics">
                {KPI_FIELDS.map((field, index) => {
                  const rows = metrics.filter(
                    (row) => row[field.key] != null && row[field.key] !== "",
                  );
                  const maxValue = Math.max(
                    0,
                    ...rows.map((row) => Math.abs(metricNumber(row[field.key]))),
                  );
                  return (
                    <article className="kpi-card" key={field.key}>
                      <div className="kpi-card-header">
                        <div className="kpi-info">
                          <h3>{field.title}</h3>
                          <p>{field.description}</p>
                        </div>
                        <div className="kpi-icon-wrapper">
                          <Icon path={field.icon} />
                        </div>
                      </div>
                      <div className="kpi-values-list">
                        {rows.map((row) => {
                          const value = metricNumber(row[field.key]);
                          const width = maxValue
                            ? (Math.abs(value) / maxValue) * 100
                            : 10;
                          return (
                            <div
                              className="kpi-value-row"
                              key={`${recordKey(row)}-${field.key}`}
                            >
                              <div className="kpi-company-label">
                                <span className="company-badge-name">
                                  <span className="company-logo-avatar">
                                    {String(row.company || "?").slice(0, 2).toUpperCase()}
                                  </span>
                                  <span>{row.company} ({row.year})</span>
                                </span>
                                <span className="kpi-val-number">{row[field.key]}</span>
                              </div>
                              <div className="kpi-compare-bar-bg">
                                <div
                                  className="kpi-compare-bar-fill"
                                  style={{
                                    width: `${width}%`,
                                    background: value < 0
                                      ? "linear-gradient(to right, var(--accent-red), rgba(244,63,94,0.4))"
                                      : `linear-gradient(to right, ${COLORS[index % COLORS.length]}, rgba(255,255,255,0.03))`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {rows.length === 0 && (
                          <p className="app-status">No data available.</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="deep-dive-section">
                <div className="section-header">
                  <div className="section-title">
                    <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <span>Qualitative Intelligence Deep-Dive</span>
                  </div>
                </div>
                <div className="deep-dive-card">
                  <div className="inspector-header">
                    <div className="inspector-meta">
                      <h2>{selectedRecord?.company || "Company Insights"}</h2>
                      <p>
                        {selectedRecord?.year
                          ? `Fiscal Year ${selectedRecord.year}`
                          : "Fiscal Year"}
                      </p>
                    </div>
                    <div className="company-selector-wrapper">
                      <label htmlFor="companySelect">Inspect Report</label>
                      <select
                        id="companySelect"
                        className="company-select"
                        value={selectedRecordKey}
                        onChange={(event) => setSelectedRecordKey(event.target.value)}
                      >
                        {metrics.map((row) => (
                          <option key={recordKey(row)} value={recordKey(row)}>
                            {row.company} ({row.year})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="qualitative-grid">
                    <QualitativeList
                      title="Top Growth Drivers"
                      items={listItems(selectedRecord?.growth_drivers)}
                      variant="drivers"
                    />
                    <QualitativeList
                      title="Top Risk Factors"
                      items={listItems(selectedRecord?.risk_factors)}
                      variant="risks"
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {(metricsState === "ready" || metricsState === "error") && metrics.length === 0 && (
            <div className="deep-dive-card empty-state">
              <Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <h2>No Corporate Data Yet</h2>
              <p>
                Ingest a company financial statement (such as a 10-K or 10-Q PDF)
                using the sidebar uploader. The AI engine will extract financial
                metrics, risks, and growth drivers.
              </p>
              {metricsState === "error" && (
                <div className="metrics-load-warning" role="status">
                  <span>{metricsError}</span>
                  <button type="button" onClick={loadMetrics}>Retry</button>
                </div>
              )}
            </div>
          )}
        </main>

        <aside className={`chat-panel${chatCollapsed ? " collapsed" : ""}`}>
          <div className="chat-panel-header">
            <div className="chat-panel-title">
              <div className="chat-panel-icon">
                <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </div>
              <div>
                <span className="chat-header-text">AI Analyst</span>
                <span className="chat-header-sub">Ask about your financial data</span>
              </div>
            </div>
            <button
              className="chat-panel-toggle"
              type="button"
              onClick={() => setChatCollapsed(true)}
              title="Collapse panel"
              aria-label="Collapse chat panel"
            >
              <Icon path="M13 5l7 7-7 7" />
            </button>
          </div>

          <div className="chat-messages" ref={messagesRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={`chat-msg ${message.role}-msg`} key={`${index}-${message.role}`}>
                <div className={`chat-avatar ${message.role}-avatar`}>
                  <Icon
                    path={message.role === "user"
                      ? "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      : "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09z"}
                  />
                </div>
                <div className={`chat-bubble ${message.role}-bubble`}>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="chat-msg bot-msg" role="status" aria-label="AI is responding">
                <div className="chat-avatar bot-avatar">
                  <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09z" />
                </div>
                <div className="chat-bubble bot-bubble typing-bubble">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <div className="chat-context-bar">
              <label className="chat-context-label" htmlFor="chatCompanySelect">
                Company
              </label>
              <select
                id="chatCompanySelect"
                className="chat-context-select"
                value={chatCompanyKey}
                onChange={(event) => updateChatCompany(event.target.value)}
              >
                <option value="">All Companies</option>
                {metrics.map((row) => (
                  <option key={recordKey(row)} value={recordKey(row)}>
                    {row.company} ({row.year})
                  </option>
                ))}
              </select>
            </div>
            <div className="chat-input-row">
              <input
                className="chat-text-input"
                type="text"
                placeholder="Ask about revenue, risks, growth..."
                autoComplete="off"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={isSending}
              />
              <button
                className="chat-send-btn"
                type="submit"
                title="Send message"
                aria-label="Send message"
                disabled={isSending || !question.trim()}
              >
                <Icon path="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </button>
            </div>
          </form>
        </aside>
      </div>

      <button
        className={`chat-collapsed-tab${chatCollapsed ? " visible" : ""}`}
        type="button"
        onClick={() => setChatCollapsed(false)}
        aria-label="Open AI chat"
      >
        <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        <span>AI Chat</span>
      </button>

      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.type} show`} key={toast.id}>
            <div className="toast-icon">
              <Icon path={toast.type === "error"
                ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                : "M5 13l4 4L19 7"} />
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
            >
              <Icon path="M6 18L18 6M6 6l12 12" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function QualitativeList({ title, items, variant }) {
  const iconPath = variant === "drivers"
    ? "M5 13l4 4L19 7"
    : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
  return (
    <div className="qualitative-column">
      <h3 className={`qual-col-title ${variant}-title`}>
        <Icon path={iconPath} />
        <span>{title}</span>
      </h3>
      <div className="qual-list">
        {items.length > 0 ? items.map((item, index) => (
          <div className="qual-item" key={`${index}-${item}`}>
            <div className={`qual-item-icon ${variant === "drivers" ? "driver-item-icon" : "risk-item-icon"}`}>
              <Icon path={iconPath} />
            </div>
            <div>{item}</div>
          </div>
        )) : (
          <div className="no-qualitative">
            <Icon path={variant === "drivers"
              ? "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-.304 0-.603-.04-.896-.12l-.548-.547z"
              : "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"} />
            <span>
              {variant === "drivers"
                ? "No growth drivers parsed for this report."
                : "No high-risk factors identified for this period."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
