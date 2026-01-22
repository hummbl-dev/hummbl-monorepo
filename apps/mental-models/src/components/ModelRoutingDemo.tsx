// Model Routing Demo Component - Shows intelligent model selection in action

import { useState } from 'react';
import { intelligentRouting } from '../services/intelligentRouting';
import { exampleScenarios } from '../services/__tests__/modelRouter.test';

interface RoutingResult {
  selectedModel: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
}

export function ModelRoutingDemo() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeInput = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    try {
      const routing = await intelligentRouting.getRoutingDecision(input);
      setResult(routing);
    } catch (error) {
      console.error('Routing analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useExample = (example: string) => {
    setInput(example);
    setResult(null);
  };

  return (
    <div className="model-routing-demo">
      <h3>🧠 HUMMBL OS Model Router</h3>
      <p>See how HUMMBL intelligently selects the optimal AI model for your task.</p>

      {/* Input Section */}
      <div className="demo-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task... (e.g., 'Add authentication to my React app')"
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }}
        />
        <button
          onClick={analyzeInput}
          disabled={!input.trim() || isAnalyzing}
          style={{
            marginTop: '12px',
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: input.trim() && !isAnalyzing ? 'pointer' : 'not-allowed',
            opacity: input.trim() && !isAnalyzing ? 1 : 0.6,
          }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Task'}
        </button>
      </div>

      {/* Example Tasks */}
      <div className="demo-examples" style={{ marginTop: '24px' }}>
        <h4>Try these examples:</h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginTop: '12px',
          }}
        >
          <div>
            <h5 style={{ color: '#059669', margin: '0 0 8px 0' }}>🔧 Execution Tasks</h5>
            {exampleScenarios.execution.slice(0, 3).map((example, i) => (
              <button
                key={i}
                onClick={() => useExample(example)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  margin: '4px 0',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {example}
              </button>
            ))}
          </div>

          <div>
            <h5 style={{ color: '#0369a1', margin: '0 0 8px 0' }}>🧠 Reasoning Tasks</h5>
            {exampleScenarios.reasoning.slice(0, 3).map((example, i) => (
              <button
                key={i}
                onClick={() => useExample(example)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  margin: '4px 0',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {example}
              </button>
            ))}
          </div>

          <div>
            <h5 style={{ color: '#7c2d12', margin: '0 0 8px 0' }}>🎨 Creative Tasks</h5>
            {exampleScenarios.creative.slice(0, 3).map((example, i) => (
              <button
                key={i}
                onClick={() => useExample(example)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  margin: '4px 0',
                  background: '#fef7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div
          className="demo-results"
          style={{
            marginTop: '24px',
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
          }}
        >
          <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>🎯 Routing Analysis</h4>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <strong style={{ color: '#059669' }}>Selected Model:</strong>
              <div
                style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  padding: '4px 12px',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {result.selectedModel}
              </div>
            </div>

            <div>
              <strong style={{ color: '#0369a1' }}>Confidence:</strong>
              <div style={{ marginTop: '4px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${result.confidence * 100}%`,
                      height: '100%',
                      background:
                        result.confidence > 0.8
                          ? '#10b981'
                          : result.confidence > 0.6
                            ? '#f59e0b'
                            : '#ef4444',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {Math.round(result.confidence * 100)}% confident
                </span>
              </div>
            </div>

            <div>
              <strong style={{ color: '#7c2d12' }}>Reasoning:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                {result.reasoning}
              </p>
            </div>

            {result.alternatives.length > 0 && (
              <div>
                <strong style={{ color: '#6b7280' }}>Alternative Models:</strong>
                <div style={{ marginTop: '4px' }}>
                  {result.alternatives.map((alt, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        margin: '2px 4px 2px 0',
                        padding: '2px 8px',
                        background: '#e5e7eb',
                        color: '#6b7280',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: '#eff6ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
        }}
      >
        <h5 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>How it works:</h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px' }}>
          <li>
            <strong>Execution tasks</strong> → Cascade Agent (direct environment access)
          </li>
          <li>
            <strong>Analysis tasks</strong> → Claude 3.5 Sonnet (deep reasoning)
          </li>
          <li>
            <strong>Creative tasks</strong> → GPT-4 (content generation)
          </li>
        </ul>
      </div>
    </div>
  );
}
