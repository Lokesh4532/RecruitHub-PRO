'use client';

import { useState, useEffect } from 'react';

export default function ChromaDBStatus() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/chroma/sync');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching ChromaDB stats:', error);
      setStats({ error: 'ChromaDB not connected' });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/chroma/sync', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setMessage(` ${data.message}`);
        fetchStats(); // Refresh stats
      } else {
        setMessage(` ${data.error || 'Sync failed'}`);
      }
    } catch (error) {
      setMessage(` Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ChromaDB Status</h3>
          <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  const isConnected = !stats.error;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">AI Search Engine</h3>
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          ></div>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Status */}
      <div className="space-y-3">
        {isConnected ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-semibold text-green-600">✓ Connected</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Candidates Indexed:</span>
              <span className="text-sm font-bold text-gray-900">{stats.total_candidates || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Collection:</span>
              <span className="text-sm text-gray-700">{stats.collection_name || 'candidates'}</span>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`w-full mt-4 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                syncing
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
              }`}
            >
              {syncing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Syncing...
                </>
              ) : (
                ' Sync All Candidates'
              )}
            </button>

            {/* Message */}
            {message && (
              <div className={`mt-3 p-3 rounded-lg text-xs ${
                message.startsWith('') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                 Semantic search powered by ChromaDB
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-semibold text-red-600">✗ Not Connected</span>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium mb-2">
                ChromaDB server not running
              </p>
              <p className="text-xs text-yellow-700">
                Run: <code className="bg-yellow-100 px-1 py-0.5 rounded">.\start-chromadb.ps1</code>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
