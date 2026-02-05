// Cascade Agent effectiveness evaluation

export interface AgentTask {
  id: string;
  type: 'feature' | 'fix' | 'refactor' | 'test' | 'docs';
  description: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  linesAdded: number;
  linesModified: number;
  linesDeleted: number;
  filesModified: number;
  testsAdded: number;
  buildPassed: boolean;
  feedbackScore?: number; // 1-5
}

export interface AgentMetrics {
  totalTasks: number;
  successfulTasks: number;
  successRate: number;
  averageTaskTime: number;
  totalLinesWritten: number;
  totalTestsAdded: number;
  buildSuccessRate: number;
  averageFeedbackScore: number;
  productivity: number; // lines per hour
  quality: number; // success rate + build rate + feedback
  timestamp: number;
}

export interface AgentReport {
  metrics: AgentMetrics;
  recentTasks: AgentTask[];
  strengths: string[];
  improvements: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

const AGENT_TASKS_KEY = 'hummbl_agent_tasks';
const MAX_TASKS = 50;

/**
 * Record an agent task
 */
export function recordTask(task: AgentTask): void {
  const tasks = getTasks();
  tasks.push(task);

  // Keep only last MAX_TASKS
  if (tasks.length > MAX_TASKS) {
    tasks.splice(0, tasks.length - MAX_TASKS);
  }

  saveTasks(tasks);
}

/**
 * Get all tasks
 */
function getTasks(): AgentTask[] {
  try {
    const stored = localStorage.getItem(AGENT_TASKS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load agent tasks:', error);
  }
  return [];
}

/**
 * Save tasks
 */
function saveTasks(tasks: AgentTask[]): void {
  try {
    localStorage.setItem(AGENT_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Failed to save agent tasks:', error);
  }
}

/**
 * Calculate agent metrics
 */
export function calculateAgentMetrics(): AgentMetrics {
  const tasks = getTasks();

  if (tasks.length === 0) {
    return {
      totalTasks: 0,
      successfulTasks: 0,
      successRate: 0,
      averageTaskTime: 0,
      totalLinesWritten: 0,
      totalTestsAdded: 0,
      buildSuccessRate: 0,
      averageFeedbackScore: 0,
      productivity: 0,
      quality: 0,
      timestamp: Date.now(),
    };
  }

  const completedTasks = tasks.filter((t) => t.endTime !== undefined);
  const successfulTasks = tasks.filter((t) => t.success).length;
  const buildPasses = tasks.filter((t) => t.buildPassed).length;

  const totalTime = completedTasks.reduce((sum, t) => sum + ((t.endTime || 0) - t.startTime), 0);

  const totalLines = tasks.reduce((sum, t) => sum + t.linesAdded + t.linesModified, 0);

  const totalTests = tasks.reduce((sum, t) => sum + t.testsAdded, 0);

  const feedbackScores = tasks
    .filter((t) => t.feedbackScore !== undefined)
    .map((t) => t.feedbackScore!);

  const avgFeedback =
    feedbackScores.length > 0
      ? feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length
      : 0;

  const successRate = successfulTasks / tasks.length;
  const buildSuccessRate = buildPasses / tasks.length;
  const avgTaskTime = completedTasks.length > 0 ? totalTime / completedTasks.length : 0;

  // Productivity: lines per hour
  const totalHours = totalTime / (1000 * 60 * 60);
  const productivity = totalHours > 0 ? totalLines / totalHours : 0;

  // Quality score (0-100)
  const quality = successRate * 40 + buildSuccessRate * 30 + (avgFeedback / 5) * 30;

  return {
    totalTasks: tasks.length,
    successfulTasks,
    successRate,
    averageTaskTime: avgTaskTime,
    totalLinesWritten: totalLines,
    totalTestsAdded: totalTests,
    buildSuccessRate,
    averageFeedbackScore: avgFeedback,
    productivity,
    quality,
    timestamp: Date.now(),
  };
}

/**
 * Generate agent effectiveness report
 */
export function generateAgentReport(): AgentReport {
  const metrics = calculateAgentMetrics();
  const tasks = getTasks();
  const recentTasks = tasks.slice(-10).reverse();

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Analyze strengths
  if (metrics.successRate >= 0.9) {
    strengths.push('Excellent task completion rate');
  }
  if (metrics.buildSuccessRate >= 0.9) {
    strengths.push('High build success rate');
  }
  if (metrics.averageFeedbackScore >= 4) {
    strengths.push('Consistently positive user feedback');
  }
  if (metrics.productivity > 500) {
    strengths.push('High productivity (lines/hour)');
  }
  if (metrics.totalTestsAdded > 20) {
    strengths.push('Strong focus on testing');
  }

  // Identify improvements
  if (metrics.successRate < 0.8) {
    improvements.push('Increase task completion success rate');
  }
  if (metrics.buildSuccessRate < 0.8) {
    improvements.push('Improve code quality to pass builds consistently');
  }
  if (metrics.averageFeedbackScore < 3.5) {
    improvements.push('Focus on user satisfaction and clarity');
  }
  if (metrics.productivity < 200) {
    improvements.push('Optimize development speed');
  }
  if (metrics.totalTestsAdded < 10) {
    improvements.push('Add more test coverage');
  }

  // Calculate grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (metrics.quality >= 90) grade = 'A';
  else if (metrics.quality >= 80) grade = 'B';
  else if (metrics.quality >= 70) grade = 'C';
  else if (metrics.quality >= 60) grade = 'D';
  else grade = 'F';

  return {
    metrics,
    recentTasks,
    strengths,
    improvements,
    grade,
  };
}

/**
 * Get task type distribution
 */
export function getTaskTypeDistribution(): Record<AgentTask['type'], number> {
  const tasks = getTasks();
  const distribution: Record<AgentTask['type'], number> = {
    feature: 0,
    fix: 0,
    refactor: 0,
    test: 0,
    docs: 0,
  };

  tasks.forEach((task) => {
    distribution[task.type]++;
  });

  return distribution;
}

/**
 * Get productivity trend
 */
export function getProductivityTrend(): 'improving' | 'declining' | 'stable' {
  const tasks = getTasks();
  if (tasks.length < 5) return 'stable';

  // Split into two halves
  const mid = Math.floor(tasks.length / 2);
  const firstHalf = tasks.slice(0, mid);
  const secondHalf = tasks.slice(mid);

  const calcProductivity = (taskList: AgentTask[]) => {
    const lines = taskList.reduce((sum, t) => sum + t.linesAdded + t.linesModified, 0);
    const time = taskList.reduce((sum, t) => sum + ((t.endTime || t.startTime) - t.startTime), 0);
    return time > 0 ? lines / (time / (1000 * 60 * 60)) : 0;
  };

  const firstProd = calcProductivity(firstHalf);
  const secondProd = calcProductivity(secondHalf);

  const change = (secondProd - firstProd) / (firstProd || 1);

  if (change > 0.1) return 'improving';
  if (change < -0.1) return 'declining';
  return 'stable';
}

/**
 * Get quality trend
 */
export function getQualityTrend(): 'improving' | 'declining' | 'stable' {
  const tasks = getTasks();
  if (tasks.length < 5) return 'stable';

  const mid = Math.floor(tasks.length / 2);
  const firstHalf = tasks.slice(0, mid);
  const secondHalf = tasks.slice(mid);

  const calcQuality = (taskList: AgentTask[]) => {
    const success = taskList.filter((t) => t.success).length;
    const builds = taskList.filter((t) => t.buildPassed).length;
    return (success + builds) / (taskList.length * 2);
  };

  const firstQuality = calcQuality(firstHalf);
  const secondQuality = calcQuality(secondHalf);

  const change = (secondQuality - firstQuality) / (firstQuality || 1);

  if (change > 0.1) return 'improving';
  if (change < -0.1) return 'declining';
  return 'stable';
}

/**
 * Export agent report as text
 */
export function exportAgentReport(): string {
  const report = generateAgentReport();
  const { metrics } = report;

  let text = `# Cascade Agent Effectiveness Report\n\n`;
  text += `**Overall Grade:** ${report.grade}\n`;
  text += `**Quality Score:** ${metrics.quality.toFixed(1)}/100\n\n`;

  text += `## Performance Metrics\n`;
  text += `- Total Tasks: ${metrics.totalTasks}\n`;
  text += `- Success Rate: ${(metrics.successRate * 100).toFixed(1)}%\n`;
  text += `- Build Success Rate: ${(metrics.buildSuccessRate * 100).toFixed(1)}%\n`;
  text += `- Average Task Time: ${Math.round(metrics.averageTaskTime / 60000)} minutes\n`;
  text += `- Lines Written: ${metrics.totalLinesWritten}\n`;
  text += `- Tests Added: ${metrics.totalTestsAdded}\n`;
  text += `- Productivity: ${Math.round(metrics.productivity)} lines/hour\n`;
  text += `- Average Feedback: ${metrics.averageFeedbackScore.toFixed(1)}/5\n\n`;

  if (report.strengths.length > 0) {
    text += `## Strengths\n`;
    report.strengths.forEach((s) => {
      text += `- ${s}\n`;
    });
    text += `\n`;
  }

  if (report.improvements.length > 0) {
    text += `## Areas for Improvement\n`;
    report.improvements.forEach((i) => {
      text += `- ${i}\n`;
    });
    text += `\n`;
  }

  const distribution = getTaskTypeDistribution();
  text += `## Task Distribution\n`;
  Object.entries(distribution).forEach(([type, count]) => {
    text += `- ${type}: ${count}\n`;
  });

  return text;
}

/**
 * Clear agent tasks
 */
export function clearAgentTasks(): void {
  localStorage.removeItem(AGENT_TASKS_KEY);
}
