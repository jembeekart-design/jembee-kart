'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ModerationSettings, CommentAuditLog } from '@/types/moderation';
import { getModerationSettings, updateModerationSettings } from '@/services/moderationService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { Play } from 'lucide-react';

interface ModerationSubmission {
  id: string;
  submissionId: string;
  driveFileId: string;
  creatorId: string;
  displayName: string;
  photoURL: string;
  username: string;
  caption: string;
  hashtags: string[];
  music: string;
  sponsor: boolean;
  isEnhanced: boolean;
  status: string;
  createdAt: { toDate: () => Date } | null;
}

export default function AdminModerationDashboard() {
  const [settings, setSettings] = useState<ModerationSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<CommentAuditLog[]>([]);
  const [submissions, setSubmissions] = useState<ModerationSubmission[]>([]);
  const [newBlockedWord, setNewBlockedWord] = useState('');
  const [newAllowedWord, setNewAllowedWord] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSubmissions = useCallback(async () => {
    try {
      setMessage('Loading submissions...');
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();

      const response = await fetch('/api/admin/moderation-submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to load');

      setSubmissions(data.submissions);
      setMessage('');
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  useEffect(() => {
    getModerationSettings(true).then(setSettings);

    getDocs(query(collection(db, 'commentAuditLogs'), orderBy('timestamp', 'desc'), limit(15)))
      .then(snap => setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentAuditLog))));

    setTimeout(() => fetchSubmissions(), 0);
  }, [fetchSubmissions]);

  const handleModerationAction = async (submissionId: string, action: 'approve' | 'reject') => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();

      const response = await fetch('/api/admin/moderate-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ submissionId, action })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to process');

      setMessage(`Submission ${action}d successfully!`);
      fetchSubmissions();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(`Failed to process: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-8 text-white">Loading Enterprise Moderation Panel...</div>;

  const handleSave = async (updatedFields: Partial<ModerationSettings>, reason: string) => {
    setSaving(true);
    try {
      const adminId = auth.currentUser?.uid || 'admin_system_user';
      const merged = { ...settings, ...updatedFields };
      await updateModerationSettings(merged, adminId, reason);
      setSettings(merged);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-900 text-gray-100 rounded-lg shadow-xl">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">JembeeKart Enterprise Moderation</h1>
          <p className="text-sm text-gray-400">Manage Comments and Video Content Moderation.</p>
        </div>
        {message && <span className="text-green-400 font-medium animate-pulse">{message}</span>}
        {saving && <span className="text-blue-400">Processing...</span>}
      </div>

      {/* Video Moderation Queue */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-purple-400">Video Moderation Queue ({submissions.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-gray-700 p-4 rounded-lg space-y-2">
              <div className="aspect-[9/16] bg-black rounded overflow-hidden relative flex items-center justify-center">
                <span className="text-xs text-gray-500">Private Drive Video</span>
                <Play className="absolute inset-0 m-auto text-white/50" size={48} />
              </div>
              <p className="font-bold truncate">{sub.username}</p>
              <p className="text-xs text-gray-400">{sub.caption}</p>
              <p className="text-xs text-gray-400">Status: <span className='text-yellow-400'>{sub.status}</span></p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleModerationAction(sub.submissionId, 'approve')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white flex-1" disabled={saving}>Approve</button>
                <button onClick={() => handleModerationAction(sub.submissionId, 'reject')} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white flex-1" disabled={saving}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800 p-6 rounded-lg">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleSave({ enabled: e.target.checked }, "Toggled Global Moderation")}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="font-medium">Enable Moderation Engine</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.commentsEnabled}
            onChange={(e) => handleSave({ commentsEnabled: e.target.checked }, "Toggled Comments Globally")}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="font-medium">Allow Comments Globally</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoApproveComments}
            onChange={(e) => handleSave({ autoApproveComments: e.target.checked }, "Toggled Auto Approve")}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="font-medium">Auto Approve Comments</span>
        </label>
      </div>

      {/* Whitelist Words Section */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-emerald-400">Whitelist Words (Absolute Priority Override)</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAllowedWord}
            onChange={(e) => setNewAllowedWord(e.target.value)}
            placeholder="Add allowed word..."
            className="bg-gray-700 px-4 py-2 rounded text-white flex-1 border border-gray-600"
          />
          <button
            onClick={() => {
              if (!newAllowedWord) return;
              const updated = [...(settings.allowedWords || []), newAllowedWord.trim()];
              handleSave({ allowedWords: updated }, `Added allowed word: ${newAllowedWord}`);
              setNewAllowedWord('');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-medium text-white"
          >
            Add Whitelist
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {settings.allowedWords?.map((word, idx) => (
            <span key={idx} className="bg-emerald-900 text-emerald-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {word}
              <button
                onClick={() => {
                  const updated = settings.allowedWords.filter((_, i) => i !== idx);
                  handleSave({ allowedWords: updated }, `Removed allowed word: ${word}`);
                }}
                className="text-emerald-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Blocked Words Section */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-red-400">Blocked Words Blacklist</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBlockedWord}
            onChange={(e) => setNewBlockedWord(e.target.value)}
            placeholder="Add blocked word..."
            className="bg-gray-700 px-4 py-2 rounded text-white flex-1 border border-gray-600"
          />
          <button
            onClick={() => {
              if (!newBlockedWord) return;
              const updated = [...(settings.blockedWords || []), newBlockedWord.trim()];
              handleSave({ blockedWords: updated }, `Added blocked word: ${newBlockedWord}`);
              setNewBlockedWord('');
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium text-white"
          >
            Add Blocklist
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {settings.blockedWords?.map((word, idx) => (
            <span key={idx} className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {word}
              <button
                onClick={() => {
                  const updated = settings.blockedWords.filter((_, i) => i !== idx);
                  handleSave({ blockedWords: updated }, `Removed blocked word: ${word}`);
                }}
                className="text-red-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-blue-400">Enterprise Audit Log Trail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-700 uppercase text-xs text-gray-400">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Admin ID</th>
                <th className="p-3">Changed Fields</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-700">
                  <td className="p-3">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}</td>
                  <td className="p-3">{log.adminId}</td>
                  <td className="p-3 text-yellow-400">{log.changedFields?.join(', ')}</td>
                  <td className="p-3">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
