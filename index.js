const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dir = "uploads/";
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = file.originalname.lastIndexOf(".");
    ext = file.originalname.substr(ext + 1);
    callback(null, `${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage });

// MongoDB 연결 설정
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/midi-files', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const midiFileSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  url: String,
  title: String, // 제목 필드 추가
});
const MidiFile = mongoose.model('MidiFile', midiFileSchema);

function isMidiFile(filename) {
  return filename.endsWith('.mid');
}

// routes
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const title = req.body.title; // 클라이언트로부터 전달된 제목
  const name = title; // 파일이름첫부분

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!isMidiFile(file.originalname)) {
    return res.status(400).json({ error: "Invalid file format" });
  }

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const fileName = `${name}-${uniqueSuffix}${ext}`; // 전달된 이름과 고유한 값으로 파일 이름 생성

  const destinationPath = path.join(__dirname, "uploads", fileName);

  fs.rename(file.path, destinationPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save file" });
    }

    const url = `http://localhost:3000/uploads/${fileName}`;

    const newMidiFile = new MidiFile({ url, title }); // 제목 필드 추가
    newMidiFile.save((err, savedFile) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save file" });
      }
      res.json({ file: savedFile });
    });
  });
});

app.get('/list', async (req, res) => {
  try {
    // MongoDB에서 MIDI 파일 리스트 조회
    const files = await MidiFile.find({}, 'timestamp originalname');
    const fileList = files.map((file) => ({
      timestamp: file.timestamp,
      filename: file.originalname,
      downloadUrl: `/download/${file.filename}`, // 다운로드 URL 생성
    }));
    res.json(fileList);
  } catch (error) {
    res.status(500).send('Error retrieving MIDI file list');
  }
});



// 파일 다운로드 엔드포인트 추가
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

const port = 4000;
const hostname = '0.0.0.0';

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
