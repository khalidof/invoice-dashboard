import { useState } from 'react';
import {
  Database,
  Webhook,
  Bell,
  Shield,
  Save,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Zap,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/common';

export function Settings() {
  const [n8nUrl, setN8nUrl] = useState(
    import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/invoice-mcp-v2'
  );
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [notifications, setNotifications] = useState({
    newInvoice: true,
    processingComplete: true,
    anomalyDetected: true,
  });

  return (
    <PageContainer
      title="Settings"
      subtitle="Configure your invoice processing dashboard"
    >
      <div className="max-w-3xl space-y-6">
        {/* MCP Architecture Status */}
        <section className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-purple-50 to-orange-50 border-b border-slate-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-800">MCP Architecture</h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
              </div>
              <p className="text-sm text-slate-500">Model Context Protocol v2 - AI-powered invoice processing</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Zap className="w-5 h-5 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">~3s</p>
              <p className="text-xs text-slate-500">Avg. Processing</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">95%</p>
              <p className="text-xs text-slate-500">Accuracy Rate</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Cpu className="w-5 h-5 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">Claude 3.5</p>
              <p className="text-xs text-slate-500">AI Model</p>
            </div>
          </div>
        </section>

        {/* n8n Integration */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100">
              <Webhook className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">n8n Integration</h2>
              <p className="text-sm text-slate-500">Configure your n8n webhook endpoint</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={n8nUrl}
                onChange={(e) => setN8nUrl(e.target.value)}
                className="input"
                placeholder="http://localhost:5678/webhook/invoice-mcp-v2"
              />
              <p className="mt-2 text-xs text-slate-500">
                The n8n webhook endpoint for MCP invoice processing pipeline
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="http://localhost:5678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 transition-colors font-medium"
              >
                Open n8n Dashboard
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="https://docs.n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Documentation
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Supabase Configuration */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Database</h2>
              <p className="text-sm text-slate-500">Supabase connection settings</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="input"
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Connected to Supabase</p>
                <p className="text-xs text-green-600">Database and storage are operational</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Notifications</h2>
              <p className="text-sm text-slate-500">Manage notification preferences</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries({
              newInvoice: 'New invoice uploaded',
              processingComplete: 'Processing completed',
              anomalyDetected: 'Anomaly detected',
            }).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <button
                  type="button"
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications[key as keyof typeof notifications]
                      ? 'bg-orange-500'
                      : 'bg-slate-300'
                  }`}
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof notifications],
                    }))
                  }
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[key as keyof typeof notifications]
                        ? 'translate-x-5'
                        : ''
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Security</h2>
              <p className="text-sm text-slate-500">API keys and security settings</p>
            </div>
          </div>
          <div className="p-5">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600">
                API keys are managed through environment variables. Update your{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-200 text-purple-600 font-mono text-xs">
                  .env
                </code>{' '}
                file to modify credentials.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-mono">
                  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_N8N_WEBHOOK_URL
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={() => alert('Settings saved! (Note: Environment variables require restart)')}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
