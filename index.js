const express = require('express');
const app = express();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  console.log(file);


  res.send('File uploaded successfully');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
