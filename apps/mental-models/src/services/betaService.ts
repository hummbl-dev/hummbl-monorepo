import { BetaApplicationForm } from '../types/beta';

export interface BetaSubmissionResponse {
  success: boolean;
  message: string;
  applicationId?: string;
}

export class BetaService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hummbl.dev';
  private static readonly BETA_ENDPOINT = '/beta/applications';

  static async submitApplication(application: BetaApplicationForm): Promise<BetaSubmissionResponse> {
    try {
      // Validate required fields
      const requiredFields = [
        'firstName', 'lastName', 'email', 'currentRole', 'industry',
        'painPoints', 'discoverySource', 'expectedOutcomes', 'location'
      ];

      const missingFields = requiredFields.filter(field => !application[field as keyof BetaApplicationForm]);

      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        };
      }

      if (!application.agreeToTerms) {
        return {
          success: false,
          message: 'You must agree to the terms and conditions'
        };
      }

      // In a real implementation, this would make an API call
      // For now, we'll simulate the submission
      console.log('Submitting beta application:', application);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a mock application ID
      const applicationId = `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        message: 'Beta application submitted successfully! We\'ll review it within 24-48 hours.',
        applicationId
      };

    } catch (error) {
      console.error('Beta application submission error:', error);
      return {
        success: false,
        message: 'Failed to submit application. Please try again later.'
      };
    }
  }

  static async getApplicationStatus(applicationId: string): Promise<{ status: string; message?: string }> {
    try {
      // In a real implementation, this would check the application status
      // For now, return a mock status
      return {
        status: 'pending',
        message: 'Your application is being reviewed. We\'ll notify you within 24-48 hours.'
      };
    } catch (error) {
      console.error('Error checking application status:', error);
      return {
        status: 'error',
        message: 'Unable to check application status. Please contact support.'
      };
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateLinkedInProfile(url: string): boolean {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinRegex.test(url);
  }

  static validateGitHubProfile(url: string): boolean {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
    return githubRegex.test(url);
  }
}