"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Globe, Shield, CreditCard, Layout, Terminal, Type, Coins, Mail } from "lucide-react";

interface Config {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    language: string;
    currency: string;
    maintenanceMode: boolean;
    publicRegistration: boolean;
    customerOtpMandatory: boolean;
    logoUrl: string;
    faviconUrl: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    robotsTxt: string;
    googleClientId: string;
    googleClientSecret: string;
    facebookAppId: string;
    customCss: string;
    privacyPolicy: string;
    termsConditions: string;
    // Financial
    smsPrice: number;
    bkashAppKey: string;
    bkashAppSecret: string;
    bkashUsername: string;
    bkashPassword: string;
    bkashEnabled: boolean;
    nagadMerchantId: string;
    nagadPublicKey: string;
    nagadPrivateKey: string;
    nagadEnabled: boolean;

    // Email / SMTP
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
    smtpSecure: boolean;
    smtpFrom: string;
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // Unified Config State
    const [config, setConfig] = useState<Config>({
        // General
        platformName: "Hotelify",
        supportEmail: "",
        supportPhone: "",
        language: "en",
        currency: "BDT",
        maintenanceMode: false,
        publicRegistration: true,
        customerOtpMandatory: true,

        // Branding
        logoUrl: "",
        faviconUrl: "",

        // SEO
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        robotsTxt: "User-agent: *\nAllow: /",

        // Integrations
        googleClientId: "",
        googleClientSecret: "",
        facebookAppId: "",

        // Tech
        customCss: "",

        // Legal
        privacyPolicy: "",
        termsConditions: "",

        // Financial
        smsPrice: 0.50,
        bkashAppKey: "",
        bkashAppSecret: "",
        bkashUsername: "",
        bkashPassword: "",
        bkashEnabled: false,
        nagadMerchantId: "",
        nagadPublicKey: "",
        nagadPrivateKey: "",
        nagadEnabled: false,

        // Email
        smtpHost: "",
        smtpPort: "587",
        smtpUser: "",
        smtpPass: "",
        smtpSecure: false,
        smtpFrom: "no-reply@hotelify.com"
    });

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.config) {
                    setConfig(prev => ({ ...prev, ...data.config }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.success) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (err) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestSMTP = async () => {
        setTestingSmtp(true);
        try {
            const res = await fetch('/api/admin/settings/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();

            if (data.success) {
                alert('SMTP Connection Successful!');
            } else {
                alert(`SMTP Test Failed: ${data.error}`);
            }
        } catch (err) {
            alert('Error connecting to Server');
        } finally {
            setTestingSmtp(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    const tabs = [
        { id: "general", label: "General & Branding", icon: Globe },
        { id: "email", label: "Email & SMTP", icon: Mail },
        { id: "templates", label: "Email Templates", icon: Type },
        { id: "seo", label: "SEO & Tech", icon: Terminal },
        { id: "integrations", label: "Integrations", icon: CreditCard },
        { id: "financial", label: "Financial", icon: Coins },
        { id: "legal", label: "Legal Pages", icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">System Settings</h1>
                    <p className="text-gray-400">Configure global platform behavior</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 space-x-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === tab.id
                            ? "border-purple-500 text-purple-400"
                            : "border-transparent text-gray-400 hover:text-white"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">

                {/* General & Branding Tab */}
                {activeTab === "general" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Platform Name" value={config.platformName} onChange={(v: string) => setConfig({ ...config, platformName: v })} />
                            <InputGroup label="Support Email" value={config.supportEmail} onChange={(v: string) => setConfig({ ...config, supportEmail: v })} />
                            <InputGroup label="Support Phone" value={config.supportPhone} onChange={(v: string) => setConfig({ ...config, supportPhone: v })} />
                            <InputGroup label="Default Currency" value={config.currency} onChange={(v: string) => setConfig({ ...config, currency: v })} />
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Layout className="h-5 w-5 text-purple-400" /> Branding</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Logo URL" value={config.logoUrl} onChange={(v: string) => setConfig({ ...config, logoUrl: v })} placeholder="https://..." />
                                <InputGroup label="Favicon URL" value={config.faviconUrl} onChange={(v: string) => setConfig({ ...config, faviconUrl: v })} placeholder="https://..." />
                            </div>
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-bold mb-4">System Toggles</h3>
                            <div className="flex gap-8">
                                <Toggle label="Public Registration" active={config.publicRegistration} onChange={(v: boolean) => setConfig({ ...config, publicRegistration: v })} />
                                <Toggle label="Maintenance Mode" active={config.maintenanceMode} onChange={(v: boolean) => setConfig({ ...config, maintenanceMode: v })} />
                                <Toggle label="Mandatory Customer OTP" active={config.customerOtpMandatory} onChange={(v: boolean) => setConfig({ ...config, customerOtpMandatory: v })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Email & SMTP Tab */}
                {activeTab === "email" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-blue-900/30 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                </div>
                                SMTP Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                                <InputGroup label="SMTP Host" value={config.smtpHost} onChange={(v: string) => setConfig({ ...config, smtpHost: v })} placeholder="smtp.gmail.com" />
                                <InputGroup label="SMTP Port" value={config.smtpPort} onChange={(v: string) => setConfig({ ...config, smtpPort: v })} placeholder="587" />
                                <InputGroup label="SMTP User" value={config.smtpUser} onChange={(v: string) => setConfig({ ...config, smtpUser: v })} placeholder="user@example.com" />
                                <InputGroup label="SMTP Password" value={config.smtpPass} onChange={(v: string) => setConfig({ ...config, smtpPass: v })} type="password" />
                                <InputGroup label="From Email" value={config.smtpFrom} onChange={(v: string) => setConfig({ ...config, smtpFrom: v })} placeholder="no-reply@hotelify.com" />
                                <div className="md:col-span-2">
                                    <Toggle label="Secure Protocol (SSL/TLS)" active={config.smtpSecure} onChange={(v: boolean) => setConfig({ ...config, smtpSecure: v })} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                            <button
                                onClick={handleTestSMTP}
                                disabled={testingSmtp || !config.smtpHost}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {testingSmtp ? <Loader2 className="animate-spin h-4 w-4" /> : <Mail className="h-4 w-4" />}
                                Test Connection
                            </button>
                            <p className="text-gray-400 text-sm">
                                Note: These settings are used for sending system emails like OTPs, booking confirmations, and password resets.
                            </p>
                        </div>
                    </div>
                )}

                {/* SEO & Tech Tab */}
                {activeTab === "seo" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 gap-6">
                            <InputGroup label="Meta Title (Default)" value={config.metaTitle} onChange={(v: string) => setConfig({ ...config, metaTitle: v })} />
                            <InputGroup label="Meta Description" value={config.metaDescription} onChange={(v: string) => setConfig({ ...config, metaDescription: v })} type="textarea" />
                            <InputGroup label="Meta Keywords" value={config.metaKeywords} onChange={(v: string) => setConfig({ ...config, metaKeywords: v })} placeholder="hotel, booking, saas..." />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Robots.txt Content" value={config.robotsTxt} onChange={(v: string) => setConfig({ ...config, robotsTxt: v })} type="textarea" rows={6} fontMono />
                                <InputGroup label="Custom CSS" value={config.customCss} onChange={(v: string) => setConfig({ ...config, customCss: v })} type="textarea" rows={6} fontMono placeholder=".header { background: red; }" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Integrations Tab */}
                {activeTab === "integrations" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <h3 className="text-lg font-bold mb-4">Social Login (NextAuth/OAuth)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Google Client ID" value={config.googleClientId} onChange={(v: string) => setConfig({ ...config, googleClientId: v })} />
                                <InputGroup label="Google Client Secret" value={config.googleClientSecret} onChange={(v: string) => setConfig({ ...config, googleClientSecret: v })} type="password" />
                                <InputGroup label="Facebook App ID" value={config.facebookAppId} onChange={(v: string) => setConfig({ ...config, facebookAppId: v })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Financial Tab */}
                {activeTab === "financial" && (
                    <div className="space-y-8 animate-in fade-in">
                        {/* SMS Pricing */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-yellow-900/30 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-yellow-500" />
                                </div>
                                SMS Pricing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Cost Per SMS (BDT)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors"
                                        value={config.smsPrice || 0.50}
                                        onChange={e => setConfig({ ...config, smsPrice: Number(e.target.value) })}
                                        step="0.01"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This is the amount deducted from the hotel's wallet for each SMS sent.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* bKash Configuration */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-pink-900/30 rounded-lg">
                                    <img src="https://www.bkash.com/favicon.ico" alt="bKash" className="h-5 w-5 opacity-80" />
                                </div>
                                bKash Payment Gateway
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                                <InputGroup label="App Key" value={config.bkashAppKey} onChange={(v: string) => setConfig({ ...config, bkashAppKey: v })} />
                                <InputGroup label="App Secret" value={config.bkashAppSecret} onChange={(v: string) => setConfig({ ...config, bkashAppSecret: v })} type="password" />
                                <InputGroup label="Username" value={config.bkashUsername} onChange={(v: string) => setConfig({ ...config, bkashUsername: v })} />
                                <InputGroup label="Password" value={config.bkashPassword} onChange={(v: string) => setConfig({ ...config, bkashPassword: v })} type="password" />
                                <div className="md:col-span-2">
                                    <Toggle label="Enable bKash Payments" active={config.bkashEnabled} onChange={(v: boolean) => setConfig({ ...config, bkashEnabled: v })} />
                                </div>
                            </div>
                        </div>

                        {/* Nagad Configuration */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-orange-900/30 rounded-lg">
                                    <div className="h-5 w-5 bg-orange-500 rounded-full" />
                                </div>
                                Nagad Payment Gateway
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                                <InputGroup label="Merchant ID" value={config.nagadMerchantId} onChange={(v: string) => setConfig({ ...config, nagadMerchantId: v })} />
                                <InputGroup label="Public Key" value={config.nagadPublicKey} onChange={(v: string) => setConfig({ ...config, nagadPublicKey: v })} type="textarea" rows={3} fontMono />
                                <InputGroup label="Private Key" value={config.nagadPrivateKey} onChange={(v: string) => setConfig({ ...config, nagadPrivateKey: v })} type="textarea" rows={3} fontMono />
                                <div className="md:col-span-2">
                                    <Toggle label="Enable Nagad Payments" active={config.nagadEnabled} onChange={(v: boolean) => setConfig({ ...config, nagadEnabled: v })} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Templates Tab */}
                {activeTab === "templates" && (
                    <EmailTemplatesManager />
                )}

                {/* Legal Tab */}
                {activeTab === "legal" && (
                    <div className="space-y-6 animate-in fade-in">
                        <InputGroup label="Privacy Policy" value={config.privacyPolicy} onChange={(v: string) => setConfig({ ...config, privacyPolicy: v })} type="textarea" rows={10} />
                        <InputGroup label="Terms & Conditions" value={config.termsConditions} onChange={(v: string) => setConfig({ ...config, termsConditions: v })} type="textarea" rows={10} />
                    </div>
                )}

            </div>
        </div >
    );
}

// Sub-component for Email Templates to keep main file cleaner
function EmailTemplatesManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState('otp');
    const [subject, setSubject] = useState('');
    const [html, setHtml] = useState('');
    const [variables, setVariables] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const TEMPLATE_TYPES = [
        { id: 'otp', label: 'OTP Verification', vars: ['name', 'otp'] },
        { id: 'welcome', label: 'Welcome Email', vars: ['name'] },
        { id: 'booking_confirmation', label: 'Booking Confirmation', vars: ['name', 'hotelName', 'bookingId', 'dates', 'totalAmount'] },
    ];

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        const t = templates.find(t => t.type === selectedType);
        if (t) {
            setSubject(t.subject);
            setHtml(t.htmlContent);
        } else {
            // Defaults if not found in DB
            setSubject(selectedType === 'otp' ? 'Verify your account' : 'Welcome to Hotelify');
            setHtml('');
        }
        setVariables(TEMPLATE_TYPES.find(t => t.id === selectedType)?.vars || []);
    }, [selectedType, templates]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/email-templates');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/email-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedType,
                    subject,
                    htmlContent: html,
                    variables
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Template saved successfully');
                fetchTemplates(); // Refresh
            } else {
                alert('Failed to save');
            }
        } catch (err) {
            alert('Error creating template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex gap-4 mb-6">
                {TEMPLATE_TYPES.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedType === t.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject Line</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-400">HTML Content</label>
                        <div className="text-xs text-gray-500">
                            Available Variables: {variables.map(v => <span key={v} className="bg-gray-700 px-1 rounded ml-1 text-gray-300">{'{{' + v + '}}'}</span>)}
                        </div>
                    </div>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        rows={15}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white outline-none focus:border-purple-500 font-mono text-sm"
                        placeholder="<html><body>...</body></html>"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InputGroupProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    rows?: number;
    fontMono?: boolean;
}

function InputGroup({ label, value, onChange, type = "text", placeholder = "", rows = 4, fontMono = false }: InputGroupProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors ${fontMono ? 'font-mono text-sm' : ''}`}
                    rows={rows}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

function Toggle({ label, active, onChange }: { label: string, active: boolean, onChange: (v: boolean) => void }) {
    return (
        <div
            onClick={() => onChange(!active)}
            className={`flex items-center gap-3 cursor-pointer py-2`}
        >
            <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-purple-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
            </div>
            <span className={active ? 'text-white font-medium' : 'text-gray-400'}>{label}</span>
        </div>
    );
}
