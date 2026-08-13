const StudySession = require('../models/StudySession');

async function getNextBestAction(userId) {
  try {
    const recentSession = await StudySession.findOne({ user: userId }).sort({ updatedAt: -1 });
    
    if (!recentSession || !recentSession.importantTopics || recentSession.importantTopics.length === 0) {
      return {
        action: 'UPLOAD_SYLLABUS',
        title: 'Upload Exam Syllabus',
        description: 'Upload your course syllabus to generate your prioritized study roadmap.',
        target: '/study'
      };
    }

    const topics = recentSession.importantTopics;
    const mastery = recentSession.masteryScores || new Map();

    for (const topic of topics) {
      const topicName = typeof topic === 'string' ? topic : (topic.topic || topic.name || 'Core Concept');
      const score = mastery.get ? (mastery.get(topicName) || 0) : 0;
      
      if (score < 80) {
        return {
          action: 'REVISE_TOPIC',
          title: `Master ${topicName}`,
          description: `Current mastery: ${score}%. Complete revision and practice PYQ questions.`,
          session_id: recentSession._id,
          topic: topicName,
          target: `/study`
        };
      }
    }

    return {
      action: 'PRACTICE_MOCK',
      title: 'Practice PYQ & Mock Test',
      description: 'You have revised all key syllabus topics! Take a practice assessment.',
      session_id: recentSession._id,
      target: `/study`
    };
  } catch (error) {
    console.error('[RoadmapService] Error getting next action:', error.message);
    return null;
  }
}

async function updateTopicMastery(userId, sessionId, topicName, score) {
  try {
    const session = await StudySession.findOne({ _id: sessionId, user: userId });
    if (!session) return false;

    if (!session.masteryScores) {
      session.masteryScores = new Map();
    }

    session.masteryScores.set(topicName, score);
    await session.save();
    return true;
  } catch (error) {
    console.error('[RoadmapService] Error updating mastery score:', error.message);
    return false;
  }
}

module.exports = {
  getNextBestAction,
  updateTopicMastery
};
