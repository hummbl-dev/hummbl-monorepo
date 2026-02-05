// Analytics dashboard for viewing user metrics and behavior

import { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

interface AnalyticsData {
  users: {
    dau: number;
    wau: number;
    mau: number;
    newUsers: number;
    returningUsers: number;
  };
  content: {
    topModels: Array<{ id: string; name: string; views: number }>;
    topNarratives: Array<{ id: string; title: string; views: number }>;
  };
  engagement: {
    avgSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  searches: {
    topQueries: Array<{ query: string; count: number }>;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call to Plausible or GA4
      // For now, use mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData: AnalyticsData = {
        users: {
          dau: 250,
          wau: 1200,
          mau: 3500,
          newUsers: 800,
          returningUsers: 2700,
        },
        content: {
          topModels: [
            { id: 'MM-001', name: 'First Principles Thinking', views: 1250 },
            { id: 'MM-002', name: 'Second-Order Thinking', views: 980 },
            { id: 'MM-003', name: 'Inversion', views: 875 },
            { id: 'MM-004', name: 'Circle of Competence', views: 720 },
            { id: 'MM-005', name: "Occam's Razor", views: 650 },
          ],
          topNarratives: [
            { id: 'NAR-001', title: 'The Dunning-Kruger Effect', views: 2100 },
            { id: 'NAR-002', title: 'Cognitive Biases', views: 1850 },
            { id: 'NAR-003', title: 'Systems Thinking', views: 1620 },
          ],
        },
        engagement: {
          avgSessionDuration: 285, // seconds
          bounceRate: 32, // percentage
          pagesPerSession: 3.8,
        },
        searches: {
          topQueries: [
            { query: 'decision making', count: 450 },
            { query: 'cognitive bias', count: 380 },
            { query: 'systems thinking', count: 320 },
            { query: 'mental models', count: 290 },
            { query: 'critical thinking', count: 250 },
          ],
        },
      };

      setData(mockData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard error">
        <div className="error-message">{error}</div>
        <button onClick={fetchAnalytics}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>User behavior and content performance metrics</p>
        </div>

        <div className="date-range-selector">
          <button className={dateRange === '7d' ? 'active' : ''} onClick={() => setDateRange('7d')}>
            7 Days
          </button>
          <button
            className={dateRange === '30d' ? 'active' : ''}
            onClick={() => setDateRange('30d')}
          >
            30 Days
          </button>
          <button
            className={dateRange === '90d' ? 'active' : ''}
            onClick={() => setDateRange('90d')}
          >
            90 Days
          </button>
        </div>
      </header>

      <section className="analytics-section">
        <h2>Users</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{data.users.mau.toLocaleString()}</div>
            <div className="metric-label">Monthly Active Users</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.users.wau.toLocaleString()}</div>
            <div className="metric-label">Weekly Active Users</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.users.dau.toLocaleString()}</div>
            <div className="metric-label">Daily Active Users</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {Math.round((data.users.returningUsers / data.users.mau) * 100)}%
            </div>
            <div className="metric-label">Returning Users</div>
          </div>
        </div>
      </section>

      <section className="analytics-section">
        <h2>Engagement</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{formatDuration(data.engagement.avgSessionDuration)}</div>
            <div className="metric-label">Avg Session Duration</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.engagement.pagesPerSession.toFixed(1)}</div>
            <div className="metric-label">Pages per Session</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.engagement.bounceRate}%</div>
            <div className="metric-label">Bounce Rate</div>
          </div>
        </div>
      </section>

      <div className="analytics-row">
        <section className="analytics-section half">
          <h2>Top Mental Models</h2>
          <div className="ranking-list">
            {data.content.topModels.map((model, index) => (
              <div key={model.id} className="ranking-item">
                <div className="rank-number">#{index + 1}</div>
                <div className="rank-content">
                  <div className="rank-title">{model.name}</div>
                  <div className="rank-id">{model.id}</div>
                </div>
                <div className="rank-value">{model.views.toLocaleString()} views</div>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-section half">
          <h2>Top Narratives</h2>
          <div className="ranking-list">
            {data.content.topNarratives.map((narrative, index) => (
              <div key={narrative.id} className="ranking-item">
                <div className="rank-number">#{index + 1}</div>
                <div className="rank-content">
                  <div className="rank-title">{narrative.title}</div>
                  <div className="rank-id">{narrative.id}</div>
                </div>
                <div className="rank-value">{narrative.views.toLocaleString()} views</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="analytics-section">
        <h2>Top Search Queries</h2>
        <div className="search-queries">
          {data.searches.topQueries.map((query, index) => (
            <div key={index} className="query-item">
              <div className="query-rank">#{index + 1}</div>
              <div className="query-text">{query.query}</div>
              <div className="query-bar">
                <div
                  className="query-bar-fill"
                  style={{
                    width: `${(query.count / data.searches.topQueries[0].count) * 100}%`,
                  }}
                />
              </div>
              <div className="query-count">{query.count}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="analytics-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p>Data refreshes hourly</p>
      </footer>
    </div>
  );
};
