const express = require('express');
const cors = require('cors');
const uploadRouter = require('./upload');
const MidiFile = require('./database');
const fs = require('fs');
const fsPromises = require('fs').promises;

const path = require('path');

const app = express();
app.use(cors({
  origin: '*',
}));

// Other middleware and routes setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/upload', uploadRouter);


app.get('/list', async (req, res) => {
  try {
    const files = await MidiFile.find({}, 'filename timestamp title');
    const fileList = files.map((file) => ({
      timestamp: file.timestamp,
      filename: file.filename,
      title: file.title,
      imgurl: file.imgurl,
      subtitle: file.subtitle,
      rank: file.rank,
      poster: file.poster,
      like: file.like,
      views: file.views,
      music_length: file.music_length,
      downloadUrl: `/download/${encodeURIComponent(file.filename)}`,
      deleteUrl: `/delete/${encodeURIComponent(file.filename)}`,
    }));
    res.json(fileList);
    console.log(fileList);
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

// 파일 삭제 API
app.delete('/delete/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);


  try {
    // 데이터베이스에서 해당 파일 정보 삭제
    await MidiFile.deleteOne({ filename });

    // 파일 존재 확인
    const fileStats = await fs.promises.stat(filePath);
    if (!fileStats.isFile()) {
      return res.status(404).send('File not found');
    }

    // 파일 삭제
    await fs.promises.unlink(filePath);
    res.send('File deleted successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error deleting the file');
  }
});

const port = 8000;
const hostname = '0.0.0.0';

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
