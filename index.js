const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');


// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/midi-files', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const midiFileSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  url: String,
});
const MidiFile = mongoose.model('MidiFile', midiFileSchema);


function isMidiFile(filename) {
  return filename.endsWith('.mid');
}

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  console.log(file);

  // 업로드된 파일이 MIDI 파일인지 확인
  if (!isMidiFile(file.originalname)) {
    res.status(400).send('Invalid file format....');
    return;
  }

  // 여기에서 파일을 처리하거나 원하는 작업을 수행할 수 있습니다.

  res.send('File uploaded successfully');
});

app.get('/list', async (req, res) => {
  try {
    // MongoDB에서 MIDI 파일 리스트 조회
    const files = await MidiFile.find({}, 'timestamp url');
    const fileList = files.map((file) => ({
      timestamp: file.timestamp,
      url: file.url,
    }));
    res.json(fileList);
  } catch (error) {
    res.status(500).send('Error retrieving MIDI file list');
  }
});


const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
