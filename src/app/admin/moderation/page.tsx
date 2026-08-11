'use client';

import React, { useState, useEffect } from 'react';
import { ModerationSettings, RegexRule, CommentAuditLog, ReviewQueueItem } from '@/types/moderation';
import { getModerationSettings, updateModerationSettings, getRegexRules } from '@/services/moderationService';
import { collection, getDocs, query, orderBy, limit, where, updateDoc, doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Play } from 'lucide-react';

interface VideoModerationItem {
  id: string;
  creatorId: string;
  username: string;
  displayName: string;
  video: string;
  thumbnail: string;
  caption: string;
  hashtags: string[];
  status: string;
  moderation: string;
  coins: number;
  pendingCoins: number;
  createdAt: any;
}

export default function AdminModerationDashboard() {
  const [settings, setSettings] = useState<ModerationSettings | null>(null);
  const [regexRules, setRegexRules] = useState<RegexRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<CommentAuditLog[]>([]);
  const [pendingReports, setPendingReports] = useState<ReviewQueueItem[]>([]);
  const [videoQueue, setVideoQueue] = useState<VideoModerationItem[]>([]);
  const [newBlockedWord, setNewBlockedWord] = useState('');
  const [newAllowedWord, setNewAllowedWord] = useState('');
  const [adminId] = useState('admin_system_user'); // Authenticated admin placeholder
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getModerationSettings(true).then(setSettings);
    getRegexRules().then(setRegexRules);

    getDocs(query(collection(db, 'commentAuditLogs'), orderBy('timestamp', 'desc'), limit(15)))
      .then(snap => setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentAuditLog))));

    getDocs(query(collection(db, 'videoCommentReports'), where('status', '==', 'pending')))
      .then(snap => setPendingReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReviewQueueItem))));

    fetchVideoQueue();
  }, []);

  const fetchVideoQueue = async () => {
    try {
      console.log('MODERATION: querying watchEarnVideos...');

      const q = query(
        collection(db, 'watchEarnVideos'),
        where('status', 'in', ['pending', 'rejected']),
        orderBy('createdAt', 'desc')
      );

      const snap = await getDocs(q);

      console.log('MODERATION: documents found =', snap.size);

      setVideoQueue(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }) as VideoModerationItem)
      );

      setMessage(`DEBUG: ${snap.size} moderation videos found`);
    } catch (error) {
      console.error('MODERATION QUERY ERROR:', error);
      setMessage(
        `DEBUG ERROR: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const handleVideoAction = async (videoId: string, action: 'approved' | 'rejected') => {
    setSaving(true);
    try {
      const videoRef = doc(db, 'watchEarnVideos', videoId);
      await runTransaction(db, async (transaction) => {
        const videoDoc = await transaction.get(videoRef);
        if (!videoDoc.exists()) throw "Video not found";
        const data = videoDoc.data();

        const updatePayload = action === 'approved' ? {
          status: 'approved',
          moderation: 'safe',
          coins: data.pendingCoins || 0,
          pendingCoins: 0,
          moderationCheckedAt: serverTimestamp()
        } : {
          status: 'rejected',
          moderation: 'rejected',
          coins: 0,
          pendingCoins: 0,
          moderationCheckedAt: serverTimestamp()
        };

        transaction.update(videoRef, updatePayload);
      });
      setMessage(`Video ${action} successfully!`);
      fetchVideoQueue();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update video status.');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewAction = async (reportId: string, action: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'videoCommentReports', reportId), { status: action });
      setPendingReports(prev => prev.filter(p => p.id !== reportId));
      setMessage(`Report ${action} successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update report.');
    }
  };

  if (!settings) return <div className="p-8 text-white">Loading Enterprise Moderation Panel...</div>;

  const handleSave = async (updatedFields: Partial<ModerationSettings>, reason: string) => {
    setSaving(true);
    try {
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
        <h2 className="text-lg font-semibold text-purple-400">Video Moderation Queue ({videoQueue.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoQueue.map((video) => (
            <div key={video.id} className="bg-gray-700 p-4 rounded-lg space-y-2">
              <div className="aspect-[9/16] bg-black rounded overflow-hidden relative">
                <img src={video.thumbnail} className="w-full h-full object-cover" />
                <Play className="absolute inset-0 m-auto text-white/50" size={48} />
              </div>
              <p className="font-bold truncate">{video.username}</p>
              <p className="text-xs text-gray-400">{video.caption}</p>
              <p className="text-xs">Status: <span className={video.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}>{video.status}</span></p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleVideoAction(video.id, 'approved')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white flex-1">Approve</button>
                <button onClick={() => handleVideoAction(video.id, 'rejected')} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white flex-1">Reject</button>
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

      {/* Whitelist Words Section (Overrides Blocked Words) */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-emerald-400">Whitelist Words (Absolute Priority Override)</h2>
        <p className="text-xs text-gray-400">Words specified here will bypass blocklist filters and profanity rules.</p>
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

      {/* Rate Limits & Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Max Comment Length</label>
          <input
            type="number"
            value={settings.maxCommentLength}
            onChange={(e) => handleSave({ maxCommentLength: parseInt(e.target.value) || 500 }, "Updated max length")}
            className="bg-gray-700 w-full px-3 py-2 rounded border border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Comments Per Minute (Flood Limit)</label>
          <input
            type="number"
            value={settings.maxCommentsPerMinute}
            onChange={(e) => handleSave({ maxCommentsPerMinute: parseInt(e.target.value) || 5 }, "Updated flood per minute")}
            className="bg-gray-700 w-full px-3 py-2 rounded border border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duplicate Window (Seconds)</label>
          <input
            type="number"
            value={settings.duplicateCommentWindowSeconds}
            onChange={(e) => handleSave({ duplicateCommentWindowSeconds: parseInt(e.target.value) || 60 }, "Updated duplicate window")}
            className="bg-gray-700 w-full px-3 py-2 rounded border border-gray-600"
          />
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
