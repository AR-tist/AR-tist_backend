const http = require('http');
const fs = require('fs');
const { createWriteStream } = require('fs');
const MidiWriter = require('midi-writer-js');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const hostname = '127.0.0.1';
const port = 4000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Send HTML file for the homepage
    fs.readFile('index.html', 'utf8', (err, content) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    });
  } else if (req.method === 'POST' && req.url === '/upload') {
    // Handle file upload and conversion
    let data = '';
    
    req.on('data', chunk => {
      data += chunk;
    });
    
    req.on('end', () => {
      // Convert data to MIDI file using MidiWriter
      const file = new MidiWriter.Writer();
      // Add your MIDI file creation logic here
      
      // Save MIDI file
      const fileName = 'output.mid';
      const fileStream = createWriteStream(fileName);
      fileStream.write(new Uint8Array(file.buildFile()));
      
      fileStream.on('finish', () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      });
      
      fileStream.on('error', err => {
        console.error('Error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      });
      
      fileStream.end();
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  console.log(file);


  res.send('File uploaded successfully');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
