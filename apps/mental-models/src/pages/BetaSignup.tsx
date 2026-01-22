import React, { useState } from 'react';
import { BetaApplicationForm } from '../types/beta';
import { BetaService } from '../services/betaService';

const BetaSignup: React.FC = () => {
  const [formData, setFormData] = useState<Partial<BetaApplicationForm>>({
    primaryLanguages: [],
    frameworks: [],
    problemTypes: [],
    currentFrameworks: [],
    integrationNeeds: [],
    weeklyHours: 2,
    feedbackFrequency: 'weekly',
    participationDuration: 3,
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof BetaApplicationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof BetaApplicationForm, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[] || []), value]
        : (prev[field] as string[] || []).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await BetaService.submitApplication(formData as BetaApplicationForm);

      if (response.success) {
        setSubmitMessage(response.message);
        // Reset form on success
        setFormData({
          primaryLanguages: [],
          frameworks: [],
          problemTypes: [],
          currentFrameworks: [],
          integrationNeeds: [],
          weeklyHours: 2,
          feedbackFrequency: 'weekly',
          participationDuration: 3,
          agreeToTerms: false,
        });
      } else {
        setSubmitMessage(response.message);
      }
    } catch (error) {
      setSubmitMessage('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const required = ['firstName', 'lastName', 'email', 'currentRole', 'industry', 'painPoints', 'discoverySource', 'expectedOutcomes', 'location'];
    return required.every(field => formData[field as keyof BetaApplicationForm]) && formData.agreeToTerms;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join HUMMBL Beta</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be among the first to experience our AI-powered mental model transformation framework.
            Help shape the future of problem-solving with HUMMBL.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.linkedinProfile || ''}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.githubProfile || ''}
                    onChange={(e) => handleInputChange('githubProfile', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Professional Background */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Professional Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Role *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.currentRole || ''}
                    onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.yearsExperience || ''}
                  onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value))}
                >
                  <option value="">Select experience level</option>
                  <option value="1">1-2 years</option>
                  <option value="3">3-5 years</option>
                  <option value="6">6-10 years</option>
                  <option value="11">11+ years</option>
                </select>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Programming Languages</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Other'].map(lang => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.primaryLanguages?.includes(lang) || false}
                        onChange={(e) => handleArrayChange('primaryLanguages', lang, e.target.checked)}
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Problem Solving Context */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Problem Solving Context</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Types of Complex Problems You Solve</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'System Architecture Design',
                    'Performance Optimization',
                    'Security Implementation',
                    'Scalability Challenges',
                    'Integration Issues',
                    'Technical Debt Management',
                    'Team Coordination',
                    'Product Strategy'
                  ].map(problem => (
                    <label key={problem} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.problemTypes?.includes(problem) || false}
                        onChange={(e) => handleArrayChange('problemTypes', problem, e.target.checked)}
                      />
                      {problem}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Frameworks or Methodologies</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Agile', 'Scrum', 'Kanban', 'Design Thinking', 'Systems Thinking', 'TRIZ', 'Six Sigma', 'None'].map(framework => (
                    <label key={framework} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.currentFrameworks?.includes(framework) || false}
                        onChange={(e) => handleArrayChange('currentFrameworks', framework, e.target.checked)}
                      />
                      {framework}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pain Points in Current Problem-Solving *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe challenges you face with current approaches..."
                  value={formData.painPoints || ''}
                  onChange={(e) => handleInputChange('painPoints', e.target.value)}
                />
              </div>
            </div>

            {/* HUMMBL Interest */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">HUMMBL Interest</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">How did you learn about HUMMBL? *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.discoverySource || ''}
                  onChange={(e) => handleInputChange('discoverySource', e.target.value)}
                >
                  <option value="">Select source</option>
                  <option value="GitHub">GitHub</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Hacker News">Hacker News</option>
                  <option value="Conference">Conference/Event</option>
                  <option value="Colleague">Colleague/Friend</option>
                  <option value="Search">Search Engine</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Use Cases Interested in Exploring</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'Personal Problem Solving',
                    'Team Decision Making',
                    'Product Development',
                    'System Architecture',
                    'Research Projects',
                    'Educational Applications',
                    'Business Strategy',
                    'Technical Leadership'
                  ].map(useCase => (
                    <label key={useCase} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.useCases?.includes(useCase) || false}
                        onChange={(e) => handleArrayChange('useCases', useCase, e.target.checked)}
                      />
                      {useCase}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Outcomes *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What do you hope to achieve by participating in HUMMBL beta?"
                  value={formData.expectedOutcomes || ''}
                  onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                />
              </div>
            </div>

            {/* Technical Requirements */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Technical Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Development Environment</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.developmentEnvironment || ''}
                    onChange={(e) => handleInputChange('developmentEnvironment', e.target.value)}
                  >
                    <option value="">Select environment</option>
                    <option value="local">Local Development</option>
                    <option value="cloud">Cloud-Based</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Integration Needs</label>
                  <div className="space-y-2">
                    {['api', 'sdk', 'ui'].map(need => (
                      <label key={need} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.integrationNeeds?.includes(need as any) || false}
                          onChange={(e) => handleArrayChange('integrationNeeds', need, e.target.checked)}
                        />
                        {need.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Performance Expectations</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.performanceExpectations || ''}
                    onChange={(e) => handleInputChange('performanceExpectations', e.target.value)}
                  >
                    <option value="">Select expectations</option>
                    <option value="high">High Performance</option>
                    <option value="medium">Medium Performance</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Commitment */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Commitment Level</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.weeklyHours || 2}
                    onChange={(e) => handleInputChange('weeklyHours', parseInt(e.target.value))}
                  >
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="5">5+ hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Frequency</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.feedbackFrequency || 'weekly'}
                    onChange={(e) => handleInputChange('feedbackFrequency', e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Participation Duration</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.participationDuration || 3}
                    onChange={(e) => handleInputChange('participationDuration', parseInt(e.target.value))}
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Demographics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.companySize || ''}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.teamSize || ''}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  >
                    <option value="">Select size</option>
                    <option value="individual">Individual contributor</option>
                    <option value="small">Small team (2-5)</option>
                    <option value="medium">Medium team (6-15)</option>
                    <option value="large">Large team (16+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div>
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-2"
                    checked={formData.agreeToTerms || false}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/beta-terms" className="text-blue-600 hover:text-blue-800 underline">
                      Beta Terms and Conditions
                    </a>{' '}
                    and consent to the collection of anonymized usage data for product improvement. *
                  </span>
                </label>
              </div>

              {submitMessage && (
                <div className={`mb-6 p-4 rounded-md ${submitMessage.includes('error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Beta Application'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions about the beta? Contact us at <a href="mailto:beta@hummbl.dev" className="text-blue-600 hover:text-blue-800">beta@hummbl.dev</a></p>
        </div>
      </div>
    </div>
  );
};

export default BetaSignup;