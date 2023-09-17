// MongoDB 연결 설정

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ar-tist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 미디파일 저장하는 스키마 설정
const midiFileSchema = new mongoose.Schema({
  filename: String,
  title: String,
  imgurl: String,
  subtitle: String,
  rank: Number,
  poster: String,
  like: Number,
  views: Number,
  music_length: Number,
  timestamp: { type: Date, default: Date.now },
});

const MidiFile = mongoose.model('MidiFile', midiFileSchema);

module.exports = MidiFile;
