// AgentInsight: Agentic feedback loop visualization component

import React, { useEffect, useState } from 'react';
import {
  generateAgentReport,
  getTaskTypeDistribution,
  getProductivityTrend,
  getQualityTrend,
} from '../../utils/agentEffectiveness';
import './AgentInsight.css';

interface FeedbackLoopStage {
  name: string;
  status: 'active' | 'complete' | 'pending' | 'error';
  metric?: number;
  description: string;
}

export const AgentInsight: React.FC = () => {
  const [report, setReport] = useState(generateAgentReport());
  const [taskDistribution, setTaskDistribution] = useState(getTaskTypeDistribution());
  const [productivityTrend, setProductivityTrend] = useState(getProductivityTrend());
  const [qualityTrend, setQualityTrend] = useState(getQualityTrend());
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Refresh data periodically
    const interval = setInterval(() => {
      setReport(generateAgentReport());
      setTaskDistribution(getTaskTypeDistribution());
      setProductivityTrend(getProductivityTrend());
      setQualityTrend(getQualityTrend());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Animation cycle for feedback loop
  useEffect(() => {
    const animation = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(animation);
  }, []);

  // Feedback loop stages
  const feedbackLoop: FeedbackLoopStage[] = [
    {
      name: 'Task Reception',
      status: animationPhase === 0 ? 'active' : animationPhase > 0 ? 'complete' : 'pending',
      metric: report.metrics.totalTasks,
      description: 'User provides task description',
    },
    {
      name: 'Code Generation',
      status: animationPhase === 1 ? 'active' : animationPhase > 1 ? 'complete' : 'pending',
      metric: report.metrics.totalLinesWritten,
      description: 'Agent writes code and tests',
    },
    {
      name: 'Quality Check',
      status: animationPhase === 2 ? 'active' : animationPhase > 2 ? 'complete' : 'pending',
      metric: Math.round(report.metrics.buildSuccessRate * 100),
      description: 'Build and test execution',
    },
    {
      name: 'User Feedback',
      status: animationPhase === 3 ? 'active' : 'pending',
      metric: report.metrics.averageFeedbackScore,
      description: 'User reviews and provides feedback',
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '↗️';
    if (trend === 'declining') return '↘️';
    return '→';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return '#10b981';
      case 'B':
        return '#3b82f6';
      case 'C':
        return '#f59e0b';
      case 'D':
        return '#ef4444';
      case 'F':
        return '#991b1b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="agent-insight">
      <div className="insight-header">
        <h2>🤖 Agent Performance & Feedback Loop</h2>
        <div className="grade-badge" style={{ backgroundColor: getGradeColor(report.grade) }}>
          Grade: {report.grade}
        </div>
      </div>

      {/* Feedback Loop Visualization */}
      <div className="feedback-loop">
        <h3>Agentic Feedback Loop</h3>
        <div className="loop-stages">
          {feedbackLoop.map((stage, index) => (
            <div key={stage.name} className={`loop-stage ${stage.status}`} data-stage={index}>
              <div className="stage-number">{index + 1}</div>
              <div className="stage-content">
                <div className="stage-name">{stage.name}</div>
                {stage.metric !== undefined && (
                  <div className="stage-metric">
                    {stage.name === 'User Feedback'
                      ? `${stage.metric.toFixed(1)}/5`
                      : stage.name === 'Quality Check'
                        ? `${stage.metric}%`
                        : stage.metric}
                  </div>
                )}
                <div className="stage-description">{stage.description}</div>
              </div>
              {index < feedbackLoop.length - 1 && (
                <div className={`stage-arrow ${animationPhase > index ? 'active' : ''}`}>→</div>
              )}
            </div>
          ))}
        </div>
        <div className="loop-return-arrow" aria-label="Feedback returns to task reception">
          ↺ Iterative Improvement
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-label">Success Rate</div>
          <div className="metric-value">{(report.metrics.successRate * 100).toFixed(1)}%</div>
          <div className="metric-trend">{getTrendIcon(qualityTrend)} Quality</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Productivity</div>
          <div className="metric-value">
            {Math.round(report.metrics.productivity)} <span className="metric-unit">lines/hr</span>
          </div>
          <div className="metric-trend">{getTrendIcon(productivityTrend)} Output</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Build Pass Rate</div>
          <div className="metric-value">{(report.metrics.buildSuccessRate * 100).toFixed(1)}%</div>
          <div className="metric-trend">
            {report.metrics.buildSuccessRate >= 0.9
              ? '✅'
              : report.metrics.buildSuccessRate >= 0.7
                ? '⚠️'
                : '❌'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg Feedback</div>
          <div className="metric-value">
            {report.metrics.averageFeedbackScore.toFixed(1)} <span className="metric-unit">/5</span>
          </div>
          <div className="metric-trend">
            {'⭐'.repeat(Math.round(report.metrics.averageFeedbackScore))}
          </div>
        </div>
      </div>

      {/* Task Distribution */}
      <div className="task-distribution">
        <h3>Task Type Distribution</h3>
        <div className="distribution-bars">
          {Object.entries(taskDistribution).map(([type, count]) => {
            const total = Object.values(taskDistribution).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={type} className="distribution-item">
                <div className="distribution-label">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count}</span>
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill"
                    style={{ width: `${percentage}%` }}
                    data-type={type}
                  />
                </div>
                <div className="distribution-percentage">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="insights-grid">
        {report.strengths.length > 0 && (
          <div className="insights-section strengths">
            <h4>💪 Strengths</h4>
            <ul>
              {report.strengths.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {report.improvements.length > 0 && (
          <div className="insights-section improvements">
            <h4>🎯 Areas for Improvement</h4>
            <ul>
              {report.improvements.map((improvement, i) => (
                <li key={i}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Learning Indicators */}
      <div className="learning-indicators">
        <h4>🧠 Learning & Adaptation</h4>
        <div className="indicators-grid">
          <div className="indicator">
            <span className="indicator-label">Pattern Recognition</span>
            <div className="indicator-bar">
              <div
                className="indicator-fill"
                style={{
                  width: `${Math.min((report.metrics.totalTasks / 50) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="indicator-value">{report.metrics.totalTasks} tasks analyzed</span>
          </div>

          <div className="indicator">
            <span className="indicator-label">Quality Consistency</span>
            <div className="indicator-bar">
              <div
                className="indicator-fill success"
                style={{
                  width: `${report.metrics.buildSuccessRate * 100}%`,
                }}
              />
            </div>
            <span className="indicator-value">
              {(report.metrics.buildSuccessRate * 100).toFixed(0)}% reliable
            </span>
          </div>

          <div className="indicator">
            <span className="indicator-label">User Satisfaction</span>
            <div className="indicator-bar">
              <div
                className="indicator-fill feedback"
                style={{
                  width: `${(report.metrics.averageFeedbackScore / 5) * 100}%`,
                }}
              />
            </div>
            <span className="indicator-value">
              {report.metrics.averageFeedbackScore.toFixed(1)}/5 stars
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
