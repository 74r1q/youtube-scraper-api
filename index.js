import express from 'express';
import cors from 'cors';
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint greeting
app.get('/', (req, res) => {
    res.json({
        name: "YouTube AI Data API",
        status: "Online",
        usage: "Send a GET request to /api/transcript?videoId=dQw4w9WgXcQ"
    });
});

// Transcript Endpoint
app.get('/api/transcript', async (req, res) => {
    const videoId = req.query.videoId || req.query.url;

    if (!videoId) {
        return res.status(400).json({ 
            success: false, 
            error: "Please provide a videoId or url query parameter." 
        });
    }

    try {
        // Fetch the transcript bypassing official YouTube API restrictions
        const transcriptRaw = await YoutubeTranscript.fetchTranscript(videoId);
        
        // Combine all text blocks into one massive string for easy AI consumption
        const fullText = transcriptRaw.map(t => t.text).join(' ');

        res.json({
            success: true,
            videoId: videoId,
            stats: {
                totalSnippets: transcriptRaw.length,
                totalCharacters: fullText.length
            },
            fullText: fullText, // Highly requested by AI startups
            transcript: transcriptRaw // Array with timestamps
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch transcript. The video might not have captions enabled or is private.",
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`YouTube Scraper API running on port ${PORT}`);
});