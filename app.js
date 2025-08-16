javascript
import express from 'express';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const server = express();

const youtube = (apikey, video, audio) => {
  // Validate inputs
  if (!apikey || !video || !audio) {
    console.error('Error: Missing required parameters (apikey, video, or audio)');
    return;
  }

  const ffmpegCommand = [
    'ffmpeg',
    '-stream_loop', '-1',
    '-re',
    '-i', video,
    '-stream_loop', '-1',
    '-re',
    '-i', audio,
    '-vcodec', 'libx264',
    '-pix_fmt', 'yuvj420p',
    '-maxrate', '2048k',
    '-preset', 'ultrafast',
    '-r', '12',
    '-framerate', '1',
    '-g', '50',
    '-crf', '51',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-strict', 'experimental',
    '-video_track_timescale', '100',
    '-b:v', '1500k',
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${apikey}`,
  ];

  const child = spawn(ffmpegCommand[0], ffmpegCommand.slice(1));

  child.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
  });

  child.on('error', (err) => {
    console.error(`FFmpeg process error: ${err}`);
  });
};

// Set up Express routes
server.use('/', (req, res) => {
  res.send('Your Live Streaming Is All Ready Live');
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Call the youtube function with environment variables
const streamkey = process.env.STREAM_KEY;
const video = process.env.VIDEO_FILE || 'hajilok.mov';
const audio = process.env.AUDIO_URL || 'https://stream.zeno.fm/ez4m4918n98uv';

youtube(streamkey, video, audio);

export default youtube;
