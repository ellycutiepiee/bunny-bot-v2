import play from "play-dl";

(async () => {
  try {
    console.log("Searching for a video...");
    const yt_info = await play.search("Rick Roll", { limit: 1 });
    
    if (yt_info.length === 0) {
      console.log("No video found!");
      return;
    }

    const video = yt_info[0];
    console.log(`Found: ${video.title} (${video.url})`);

    console.log("Attempting to generate stream...");
    const stream = await play.stream(video.url);
    
    console.log("Stream generated successfully!");
    console.log(`Stream Type: ${stream.type}`);
    console.log("Success!");
  } catch (error) {
    console.error("Error generating stream:", error);
  }
})();
