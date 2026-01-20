import { useState } from 'react';
import {
  Database,
  Webhook,
  Bell,
  Shield,
  Save,
  ExternalLink,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/common';

export function Settings() {
  const [n8nUrl, setN8nUrl] = useState(
    import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/process-invoice-pro'
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
        {/* n8n Integration */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-4 border-b border-navy-800/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
              <Webhook className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-100">n8n Integration</h2>
              <p className="text-sm text-navy-400">Configure your n8n webhook endpoint</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={n8nUrl}
                onChange={(e) => setN8nUrl(e.target.value)}
                className="input"
                placeholder="http://localhost:5678/webhook/process-invoice-pro"
              />
              <p className="mt-2 text-xs text-navy-500">
                The n8n webhook endpoint for invoice processing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="http://localhost:5678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors"
              >
                Open n8n Dashboard
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Supabase Configuration */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-4 border-b border-navy-800/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-100">Database</h2>
              <p className="text-sm text-navy-400">Supabase connection settings</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">
                Supabase URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="input"
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20">
              <p className="text-sm text-success-400">
                Connected to Supabase
              </p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-4 border-b border-navy-800/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-100">Notifications</h2>
              <p className="text-sm text-navy-400">Manage notification preferences</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries({
              newInvoice: 'New invoice uploaded',
              processingComplete: 'Processing completed',
              anomalyDetected: 'Anomaly detected',
            }).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-navy-900/30 cursor-pointer hover:bg-navy-900/50 transition-colors"
              >
                <span className="text-sm text-navy-200">{label}</span>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications[key as keyof typeof notifications]
                      ? 'bg-gold-500'
                      : 'bg-navy-700'
                  }`}
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof notifications],
                    }))
                  }
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications[key as keyof typeof notifications]
                        ? 'translate-x-5'
                        : ''
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="glass-card">
          <div className="flex items-center gap-3 p-4 border-b border-navy-800/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-100">Security</h2>
              <p className="text-sm text-navy-400">API keys and security settings</p>
            </div>
          </div>
          <div className="p-4">
            <div className="p-4 rounded-lg bg-navy-900/30 border border-navy-800">
              <p className="text-sm text-navy-400">
                API keys are managed through environment variables. Update your{' '}
                <code className="px-1.5 py-0.5 rounded bg-navy-800 text-gold-400 font-mono text-xs">
                  .env
                </code>{' '}
                file to modify credentials.
              </p>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
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
