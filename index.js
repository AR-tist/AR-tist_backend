const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');

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

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
