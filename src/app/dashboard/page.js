"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getClientToken, getClientUser, authFetch } from "@/lib/auth-client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OverviewView from "@/components/dashboard/OverviewView";
import KnowledgeBasesView from "@/components/dashboard/KnowledgeBasesView";
import DocumentsView from "@/components/dashboard/DocumentsView";
import ByokVaultView from "@/components/dashboard/ByokVaultView";
import PlaygroundView from "@/components/dashboard/PlaygroundView";
import ApiKeysView from "@/components/dashboard/ApiKeysView";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [healthStatus, setHealthStatus] = useState(true);

  // Core Data States
  const [kbs, setKbs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data fetching functions
  const fetchKbs = useCallback(async () => {
    try {
      const res = await authFetch("/api/v1/knowledge-bases");
      const data = await res.json();
      if (res.ok) {
        setKbs(data.data?.knowledgeBases || data.data || []);
      }
    } catch {
      // Fail gracefully
    }
  }, []);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await authFetch("/api/v1/documents");
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.data?.documents || data.data || []);
      }
    } catch {
      // Fail gracefully
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await authFetch("/api/v1/embedding-configs");
      const data = await res.json();
      if (res.ok) {
        setConfigs(data.data?.configs || data.data || []);
      }
    } catch {
      // Fail gracefully
    }
  }, []);

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await authFetch("/api/v1/api-keys");
      const data = await res.json();
      if (res.ok) {
        setApiKeys(data.data?.apiKeys || data.data || []);
      }
    } catch {
      // Fail gracefully
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/health");
      setHealthStatus(res.ok);
    } catch {
      setHealthStatus(false);
    }
  }, []);

  useEffect(() => {
    const token = getClientToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    async function initializeDashboard() {
      const storedUser = getClientUser();
      if (isMounted) {
        setUser(storedUser || { email: "developer@nullback.dev", name: "Developer" });
      }

      await Promise.all([
        fetchKbs(),
        fetchDocs(),
        fetchConfigs(),
        fetchApiKeys(),
        checkHealth(),
      ]);

      if (isMounted) {
        setLoading(false);
      }
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [router, fetchKbs, fetchDocs, fetchConfigs, fetchApiKeys, checkHealth]);

  const handleSelectKb = () => {
    setActiveTab("playground");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--bg-pitch)",
      }}
    >
      {/* Top Console Navigation */}
      <DashboardNav user={user} healthStatus={healthStatus} />

      {/* Main Workspace Frame */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Navigation Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Viewport Content Area */}
        <main
          style={{
            flex: 1,
            padding: "36px 40px",
            backgroundColor: "var(--bg-pitch)",
            overflowY: "auto",
            maxWidth: "1300px",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              SYNCHRONIZING WITH ATLAS CLUSTER...
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewView
                  kbs={kbs}
                  documents={documents}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === "knowledge-bases" && (
                <KnowledgeBasesView
                  kbs={kbs}
                  refreshKbs={fetchKbs}
                  onSelectKb={handleSelectKb}
                />
              )}

              {activeTab === "documents" && (
                <DocumentsView
                  documents={documents}
                  kbs={kbs}
                  refreshDocs={fetchDocs}
                />
              )}

              {activeTab === "byok" && (
                <ByokVaultView
                  configs={configs}
                  refreshConfigs={fetchConfigs}
                />
              )}

              {activeTab === "playground" && (
                <PlaygroundView kbs={kbs} />
              )}

              {activeTab === "apikeys" && (
                <ApiKeysView
                  apiKeys={apiKeys}
                  refreshApiKeys={fetchApiKeys}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
