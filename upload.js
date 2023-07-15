const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isMidiFile } = require('./utils');
const MidiFile = require('./database');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const title = req.body.title;

  if (!file) {
    // 업로드된 파일이 없을 경우 에러 응답
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!isMidiFile(file.originalname)) {
    // 미디 파일이 아닐 경우 에러 응답
    return res.status(400).json({ error: 'Invalid file format' });
  }

  const dateSuffix = Date.now();
  const ext = path.extname(file.originalname);
  const fileName = `${title}-${dateSuffix}${ext}`;
  const destinationPath = path.join(__dirname, 'uploads', fileName);

  fs.rename(file.path, destinationPath, async (err) => {
    if (err) {
      // 파일 저장 실패 시 에러 응답
      return res.status(500).json({ error: 'Failed to save file' });
    }

    // 미디파일 스키마 새로 만드는 부분
    const newMidiFile = new MidiFile({
      filename: fileName,
      title: title,
      timestamp: Date.now(),
    });

    // 미디파일 스키마 생성했던거 몽고에 저장하는 부분
    const output = await newMidiFile.save();
    console.log(output);

    // reponse 만들기
    const response = {
        timestamp: output.timestamp,
        filename: output.filename,
        title: output.title,
        downloadUrl: `/download/${encodeURIComponent(output.filename)}`,
      };

      
    res.status(200).json(response);
  });
});

module.exports = router;
