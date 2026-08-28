"use client";
import { useState } from 'react';

export default function AudioDebugPage() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [recordedFile, setRecordedFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostic = async () => {
        if (!originalUrl || !recordedFile) return alert('Need both files');
        setLoading(true);
        const fd = new FormData();
        fd.append('recorded', recordedFile);
        fd.append('originalUrl', originalUrl);
        const res = await fetch('/api/debug/audio', { method: 'POST', body: fd });
        setResult(await res.json());
        setLoading(false);
    };

    return (
        <div className="p-8 text-black bg-white">
            <h1 className="text-2xl font-bold mb-4">Audio Merge Debugger</h1>
            <input type="text" placeholder="Original Video URL" onChange={e => setOriginalUrl(e.target.value)} className="border p-2 w-full mb-2" />
            <input type="file" onChange={e => setRecordedFile(e.target.files?.[0] || null)} className="mb-2" />
            <button onClick={runDiagnostic} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
                {loading ? 'Running...' : 'Run Merge Diagnostic'}
            </button>

            {result && (
                <div className="mt-4 space-y-4">
                    <div className="bg-gray-100 p-4">
                        <p><strong>Original Has Audio:</strong> {result.hasOriginalAudio ? 'Yes' : 'No'}</p>
                        <p><strong>Recorded Has Audio:</strong> {result.hasRecordedAudio ? 'Yes' : 'No'}</p>
                        <p><strong>Output Has Audio:</strong> {result.hasOutputAudio ? 'Yes' : 'No'}</p>
                    </div>
                    <pre className="text-xs bg-black text-green-400 p-4 overflow-x-auto">Command: {result.command}</pre>
                    <pre className="text-xs bg-gray-900 text-white p-4 overflow-x-auto">Stderr: {result.stderr}</pre>
                    <pre className="text-xs bg-gray-100 p-4 overflow-x-auto">Info Original: {result.infoOriginal}</pre>
                    <pre className="text-xs bg-gray-100 p-4 overflow-x-auto">Info Output: {result.infoOutput}</pre>
                </div>
            )}
        </div>
    );
}
