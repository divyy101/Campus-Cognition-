const fs = require('fs');
const pdfParse = require('pdf-parse');
const AIService = require('./ai/AIService');

class DocumentService {
  /**
   * Reads file buffer and extracts plain text.
   */
  static async extractText(filePath, fileType = 'pdf') {
    try {
      const dataBuffer = fs.readFileSync(filePath);

      if (fileType === 'pdf' || filePath.endsWith('.pdf')) {
        const data = await pdfParse(dataBuffer);
        return data.text || '';
      } else {
        // Plain text, markdown, code, etc.
        return dataBuffer.toString('utf-8');
      }
    } catch (e) {
      console.error(`[DocumentService] Error extracting text from ${filePath}:`, e.message);
      throw new Error(`Failed to extract text from document: ${e.message}`);
    }
  }

  /**
   * Chunks large text into sections for RAG storage.
   */
  static chunkText(text, chunkSize = 1000, overlap = 200) {
    if (!text || typeof text !== 'string') return [];
    
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentChunk.push(word);
      currentLength += word.length + 1;

      if (currentLength >= chunkSize) {
        chunks.push({
          section: `Chunk ${chunks.length + 1}`,
          content: currentChunk.join(' ')
        });
        // Retain overlap
        const overlapWords = currentChunk.slice(-Math.floor(overlap / 10));
        currentChunk = [...overlapWords];
        currentLength = currentChunk.join(' ').length;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push({
        section: `Chunk ${chunks.length + 1}`,
        content: currentChunk.join(' ')
      });
    }

    return chunks;
  }

  /**
   * RAG Q&A implementation: Finds relevant document chunks and uses AIService to answer user question.
   */
  static async answerQuestion(question, chunks = [], aiEngine = 'campus_ai') {
    if (!question) {
      throw new Error('Question parameter is required');
    }

    // Rank chunks by keyword matching density
    const qWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const scoredChunks = chunks.map(c => {
      let score = 0;
      const lowerContent = (c.content || '').toLowerCase();
      qWords.forEach(w => {
        if (lowerContent.includes(w)) score += 1;
      });
      return { ...c, score };
    });

    // Pick top 3 relevant chunks
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);

    const contextText = topChunks.map(c => `--- Section: ${c.section} ---\n${c.content}`).join('\n\n');

    const prompt = `Context from student uploaded study materials:\n${contextText}\n\nStudent Question: ${question}\n\nProvide a precise, encouraging, and clear answer based on the context above. If the answer is not in the context, synthesize the best explanation based on computer science / syllabus fundamentals.`;

    const answer = await AIService.generate({
      provider: aiEngine,
      prompt: prompt,
      systemPrompt: 'You are Campus Cognition AI, an expert academic tutor assisting students with their syllabus and notes.',
      temperature: 0.5
    });

    return {
      answer: answer,
      sources: topChunks.map(c => c.section || 'General Reference')
    };
  }
}

module.exports = DocumentService;
