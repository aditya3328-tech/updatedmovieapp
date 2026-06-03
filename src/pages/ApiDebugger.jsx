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
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
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
}\n          {/* Request info */}\n          <div>\n            <p className=\"text-xs font-semibold text-white mb-2\">📤 Request</p>\n            <div className=\"text-xs font-mono text-[#8a8ab0] space-y-1\">\n              <p>
                <span className=\"text-white\">Method:</span> {result.method}\n              </p>\n              <p>\n                <span className=\"text-white\">Full URL:</span> {result.fullUrl}\n              </p>\n              {result.params && Object.keys(result.params).length > 0 && (\n                <div>\n                  <span className=\"text-white\">Params:</span>\n                  <pre className=\"mt-1 bg-black/50 p-2 rounded overflow-x-auto\">\n                    {JSON.stringify(result.params, null, 2)}\n                  </pre>\n                </div>\n              )}\n            </div>\n          </div>\n\n          {/* Response info */}\n          <div>\n            <p className=\"text-xs font-semibold text-white mb-2\">📥 Response</p>\n            <div className=\"text-xs font-mono text-[#8a8ab0]\">\n              <p>\n                <span className=\"text-white\">Status:</span> {result.status}{' '}\n                {result.statusText}\n              </p>\n              <p>\n                <span className=\"text-white\">Size:</span> {result.responseSize} bytes\n              </p>\n              <p>\n                <span className=\"text-white\">Time:</span> {result.time}ms\n              </p>\n              <div>\n                <span className=\"text-white\">Body:</span>\n                <pre className=\"mt-1 bg-black/50 p-2 rounded overflow-x-auto max-h-48\">\n                  {typeof result.responseData === 'string'\n                    ? result.responseData\n                    : JSON.stringify(result.responseData, null, 2)}\n                </pre>\n              </div>\n            </div>\n          </div>\n\n          {/* Error info if present */}\n          {result.error && (\n            <div>\n              <p className=\"text-xs font-semibold text-red-400 mb-2\">❌ Error</p>\n              <p className=\"text-xs font-mono text-red-300\">{result.error}</p>\n            </div>\n          )}\n        </div>\n      )}\n    </div>\n  );\n};\n\nexport default function ApiDebugger() {\n  const [results, setResults] = useState([]);\n  const [loading, setLoading] = useState(false);\n  const [summary, setSummary] = useState(null);\n\n  /* Run all API tests */\n  const runTests = async () => {\n    setLoading(true);\n    setResults([]);\n    setSummary(null);\n\n    const tests = [\n      { endpoint: ENDPOINTS.SEARCH, params: { keyword: 'test', page: 1 } },\n      { endpoint: ENDPOINTS.BOTTOM_TABS, params: {} },\n      { endpoint: ENDPOINTS.WEB_CONFIG, params: {} },\n      { endpoint: ENDPOINTS.PLAY, params: { subjectId: '123' } },\n      { endpoint: ENDPOINTS.CAPTION, params: { id: 'test' } },\n      { endpoint: ENDPOINTS.RECOMMENDATIONS, params: { subjectId: '123' } },\n    ];\n\n    const testResults = await debugApi.testEndpoints(tests);\n    setResults(testResults);\n\n    /* Calculate summary */\n    const successful = testResults.filter((r) => r.success).length;\n    const failed = testResults.filter((r) => !r.success).length;\n    const avgTime = Math.round(\n      testResults.reduce((sum, r) => sum + r.time, 0) / testResults.length\n    );\n\n    setSummary({\n      total: testResults.length,\n      successful,\n      failed,\n      avgTime,\n    });\n\n    setLoading(false);\n  };\n\n  /* Auto-run on mount */\n  useEffect(() => {\n    runTests();\n  }, []);\n\n  return (\n    <div className=\"min-h-screen pt-20 md:pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto bg-[#0f0f23]\">\n      {/* Header */}\n      <div className=\"mb-8\">\n        <h1 className=\"text-3xl font-bold text-white mb-2\">🔍 API Debugger</h1>\n        <p className=\"text-sm text-[#8a8ab0]\">\n          Test all API endpoints and identify failing routes\n        </p>\n      </div>\n\n      {/* Controls */}\n      <div className=\"mb-8 flex gap-3\">\n        <button\n          onClick={runTests}\n          disabled={loading}\n          className=\"px-6 py-2.5 bg-[#6366f1] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity\"\n        >\n          {loading ? '🔄 Testing...' : '▶ Run Tests'}\n        </button>\n      </div>\n\n      {/* Summary */}\n      {summary && (\n        <div className=\"mb-8 grid grid-cols-2 md:grid-cols-4 gap-3\">\n          <div className=\"bg-white/5 border border-white/10 rounded-lg p-4\">\n            <p className=\"text-xs text-[#8a8ab0] mb-1\">Total Tests</p>\n            <p className=\"text-2xl font-bold text-white\">{summary.total}</p>\n          </div>\n          <div className=\"bg-green-500/10 border border-green-500/20 rounded-lg p-4\">\n            <p className=\"text-xs text-green-400 mb-1\">Successful</p>\n            <p className=\"text-2xl font-bold text-green-400\">{summary.successful}</p>\n          </div>\n          <div className=\"bg-red-500/10 border border-red-500/20 rounded-lg p-4\">\n            <p className=\"text-xs text-red-400 mb-1\">Failed</p>\n            <p className=\"text-2xl font-bold text-red-400\">{summary.failed}</p>\n          </div>\n          <div className=\"bg-white/5 border border-white/10 rounded-lg p-4\">\n            <p className=\"text-xs text-[#8a8ab0] mb-1\">Avg Time</p>\n            <p className=\"text-2xl font-bold text-white\">{summary.avgTime}ms</p>\n          </div>\n        </div>\n      )}\n\n      {/* Results */}\n      {results.length > 0 && (\n        <div>\n          <h2 className=\"text-xl font-bold text-white mb-4\">Test Results</h2>\n          {results.map((result, i) => (\n            <ResultItem key={i} result={result} />\n          ))}\n        </div>\n      )}\n\n      {/* Empty state */}\n      {!loading && results.length === 0 && (\n        <div className=\"text-center py-12\">\n          <p className=\"text-[#8a8ab0]\">Click \"Run Tests\" to start debugging</p>\n        </div>\n      )}\n\n      {/* Loading state */}\n      {loading && (\n        <div className=\"flex items-center justify-center py-12\">\n          <div className=\"text-center\">\n            <p className=\"text-white mb-4\">🔄 Testing endpoints...</p>\n            <div className=\"w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto\" />\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}\n