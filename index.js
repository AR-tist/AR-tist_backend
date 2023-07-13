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
    const dateSuffix = Date.now();
    let ext = file.originalname.lastIndexOf(".");
    ext = file.originalname.substr(ext + 1);
    callback(null, `${dateSuffix}.${ext}`);
  },
});

const upload = multer({ storage });

// MongoDB 연결 설정
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ar-tist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const midiFileSchema = new mongoose.Schema({
  filename: String,
  title: String,
  timestamp: { type: Date, default: Date.now },
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

  const dateSuffix = Date.now();
  const ext = path.extname(file.originalname);
  const fileName = `${name}-${dateSuffix}${ext}`; // 전달된 이름과 고유한 값으로 파일 이름 생성

  const destinationPath = path.join(__dirname, "uploads", fileName);

  fs.rename(file.path, destinationPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save file" });
    }

    const newMidiFile = new MidiFile({ fileName, title }); // 미디필드만들기

    let output;
    (async () => {
      output = await newMidiFile.save();
    })
    console.log(output);
    res.json({ file: "output" });
  });

});

app.get('/list', async (req, res) => {
  try {
    // MongoDB에서 MIDI 파일 리스트 조회
    const files = await MidiFile.find({}, 'filename timestamp title originalname');
    const fileList = files.map((file) => ({
      timestamp: file.timestamp,
      filename: file.filename,
      title: file.title,
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
