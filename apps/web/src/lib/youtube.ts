// Fetch YouTube video title from API
export async function getYouTubeTitle(videoId: string): Promise<string> {
  try {
    // Use oEmbed API (no API key required)
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }
    
    const data = await response.json();
    return data.title || 'YouTube Video';
  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    return 'YouTube Video';
  }
}

