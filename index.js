const express = require('express');
const uploadRouter = require('./upload');
const MidiFile = require('./database');

const path = require('path');

const app = express();


app.use('/upload', uploadRouter);

app.get('/list', async (req, res) => {
  try {
    const files = await MidiFile.find({}, 'filename timestamp title');
    const fileList = files.map((file) => ({
      timestamp: file.timestamp,
      filename: file.filename,
      title: file.title,
      downloadUrl: `/download/${encodeURIComponent(file.filename)}`,
    }));
    res.json(fileList);
  } catch (error) {
    res.status(500).send('Error retrieving MIDI file list');
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(404).send('File not found');
    }
  });
});

const port = 4444;
const hostname = '0.0.0.0';

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
