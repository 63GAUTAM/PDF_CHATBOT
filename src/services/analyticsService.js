const Analytics = require('../models/Analytics');

class AnalyticsService {
  /**
   * Track user action
   */
  static async trackAction(userId, actionType, metadata = {}) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await Analytics.findOne({
        userId,
        date: today
      });

      if (!analytics) {
        analytics = new Analytics({
          userId,
          date: today,
          metrics: {
            totalQuestions: 0,
            totalAnswers: 0,
            totalPdfUploads: 0,
            totalSessions: 0,
            averageAnswerQuality: 0,
            averageResponseTime: 0
          }
        });
      }

      // Update metrics based on action type
      switch (actionType) {
        case 'question':
          analytics.metrics.totalQuestions += 1;
          break;
        case 'answer':
          analytics.metrics.totalAnswers += 1;
          if (metadata.quality) {
            analytics.metrics.averageAnswerQuality = 
              (analytics.metrics.averageAnswerQuality + metadata.quality) / 2;
          }
          break;
        case 'pdf_upload':
          analytics.metrics.totalPdfUploads += 1;
          break;
        case 'session_created':
          analytics.metrics.totalSessions += 1;
          break;
        case 'api_call':
          analytics.apiCalls += 1;
          break;
        case 'error':
          analytics.errorCount += 1;
          break;
      }

      if (metadata.topic) {
        if (!analytics.topTopics.includes(metadata.topic)) {
          analytics.topTopics.push(metadata.topic);
        }
      }

      await analytics.save();
      return analytics;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw error - analytics shouldn't break the main flow
      return null;
    }
  }

  /**
   * Get user analytics for a date range
   */
  static async getUserAnalytics(userId, startDate, endDate) {
    try {
      const analytics = await Analytics.find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: -1 });

      if (analytics.length === 0) {
        return { message: 'No analytics data for this period' };
      }

      // Aggregate metrics
      const aggregated = {
        totalQuestions: 0,
        totalAnswers: 0,
        totalPdfUploads: 0,
        totalSessions: 0,
        totalApiCalls: 0,
        totalErrors: 0,
        averageQuality: 0,
        uniqueTopics: new Set(),
        dailyData: analytics
      };

      analytics.forEach(day => {
        aggregated.totalQuestions += day.metrics.totalQuestions;
        aggregated.totalAnswers += day.metrics.totalAnswers;
        aggregated.totalPdfUploads += day.metrics.totalPdfUploads;
        aggregated.totalSessions += day.metrics.totalSessions;
        aggregated.totalApiCalls += day.apiCalls;
        aggregated.totalErrors += day.errorCount;
        aggregated.averageQuality += day.metrics.averageAnswerQuality;

        day.topTopics.forEach(topic => aggregated.uniqueTopics.add(topic));
      });

      aggregated.averageQuality = Math.round(aggregated.averageQuality / analytics.length);
      aggregated.uniqueTopics = Array.from(aggregated.uniqueTopics);

      return aggregated;
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * Get global analytics
   */
  static async getGlobalAnalytics(startDate, endDate) {
    try {
      const analytics = await Analytics.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });

      const aggregated = {
        totalUsers: new Set(),
        totalQuestions: 0,
        totalAnswers: 0,
        totalPdfUploads: 0,
        totalSessions: 0,
        totalApiCalls: 0,
        popularTopics: {}
      };

      analytics.forEach(day => {
        aggregated.totalUsers.add(day.userId.toString());
        aggregated.totalQuestions += day.metrics.totalQuestions;
        aggregated.totalAnswers += day.metrics.totalAnswers;
        aggregated.totalPdfUploads += day.metrics.totalPdfUploads;
        aggregated.totalSessions += day.metrics.totalSessions;
        aggregated.totalApiCalls += day.apiCalls;

        day.topTopics.forEach(topic => {
          aggregated.popularTopics[topic] = (aggregated.popularTopics[topic] || 0) + 1;
        });
      });

      aggregated.totalUsers = aggregated.totalUsers.size;
      aggregated.popularTopics = Object.entries(aggregated.popularTopics)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

      return aggregated;
    } catch (error) {
      throw new Error(`Failed to get global analytics: ${error.message}`);
    }
  }
}

module.exports = AnalyticsService;
