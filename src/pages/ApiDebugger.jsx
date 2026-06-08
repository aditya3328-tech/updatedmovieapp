import { useState, useEffect } from 'react';
import { debugApi } from '../api/axios';
import ENDPOINTS from '../api/endpoints';

/* Status badge component */
const StatusBadge = ({ status }) => {
  const isSuccess = status === 200;
  const is404 = status === 404;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isSuccess
          ? 'bg-green-500/20 text-green-400'
          : is404
          ? 'bg-red-500/20 text-red-400'
          : 'bg-yellow-500/20 text-yellow-400'
      }`}
    >
      {status}
    </span>
  );
};

/* Result item component */
const ResultItem = ({ result }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg p-4 mb-4 bg-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-mono text-sm font-semibold text-white mb-1">
            {result.endpoint}
          </h3>
          <p className="text-xs text-[#8a8ab0] font-mono break-all">
            {result.urlWithParams}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <StatusBadge status={result.status} />
          <span className="text-xs text-[#8a8ab0]">{result.time}ms</span>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors font-semibold"
      >
        {expanded ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 bg-black/30 rounded p-3">
          <div>
            <p className="text-xs font-semibold text-white mb-2">📤 Request</p>
            <div className="text-xs font-mono text-[#8a8ab0] space-y-1">
              <p>
                <span className="text-white">Method:</span> {result.method}
              </p>
              <p>
                <span className="text-white">Full URL:</span> {result.fullUrl}
              </p>
              {result.params && Object.keys(result.params).length > 0 && (
                <div>
                  <span className="text-white">Params:</span>
                  <pre className="mt-1 bg-black/50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.params, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-white mb-2">📥 Response</p>
            <div className="text-xs font-mono text-[#8a8ab0]">
              <p>
                <span className="text-white">Status:</span> {result.status} {result.statusText}
              </p>
              <p>
                <span className="text-white">Size:</span> {result.responseSize} bytes
              </p>
              <p>
                <span className="text-white">Time:</span> {result.time}ms
              </p>
              <div>
                <span className="text-white">Body:</span>
                <pre className="mt-1 bg-black/50 p-2 rounded overflow-x-auto max-h-48">
                  {typeof result.responseData === 'string'
                    ? result.responseData
                    : JSON.stringify(result.responseData, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {result.error && (
            <div>
              <p className="text-xs font-semibold text-red-400 mb-2">❌ Error</p>
              <p className="text-xs font-mono text-red-300">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ApiDebugger() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpointKey) => {
    try {
      setLoading(true);
      const endpoint = ENDPOINTS[endpointKey];

      if (!endpoint) {
        alert(`Endpoint ${endpointKey} not found`);
        return;
      }

      const startTime = performance.now();
      const response = await debugApi(endpoint);
      const endTime = performance.now();

      const result = {
        endpoint: endpointKey,
        url: endpoint,
        method: response.config.method.toUpperCase(),
        params: response.config.params,
        fullUrl: response.config.url,
        urlWithParams: response.request?.responseURL || response.config.url,
        status: response.status,
        statusText: response.statusText,
        time: Math.round(endTime - startTime),
        responseSize: JSON.stringify(response.data).length,
        responseData: response.data,
        error: null,
      };

      setResults([result, ...results]);
    } catch (err) {
      const result = {
        endpoint: endpointKey,
        status: err.response?.status || 'ERR',
        statusText: err.response?.statusText || 'Error',
        time: 0,
        responseSize: 0,
        error: err.message,
        responseData: err.response?.data || null,
      };

      setResults([result, ...results]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[90px] md:pt-[80px] pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">API Debugger</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
        {Object.keys(ENDPOINTS).map((key) => (
          <button
            key={key}
            onClick={() => testEndpoint(key)}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg glass hover:bg-white/20 text-white transition-all disabled:opacity-50"
          >
            Test {key}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <p className="text-center text-[#8a8ab0] py-12">
            Click a button above to test an API endpoint
          </p>
        ) : (
          results.map((result, i) => <ResultItem key={i} result={result} />)
        )}
      </div>
    </div>
  );
}