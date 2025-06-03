const express = require('express');
const app = express();

const PORT = 3000;

const cors = require('cors');
app.use(cors());

app.use(express.json()); // JSON gövdeleri okuyabilmek için

// Örnek GET isteği
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Merhaba frontend!' });
});

let user = {
    id: 1,
    username: 'hasnasln', 
    name: 'hasan',
    surname: 'aslan',
    email: 'hasnasln0207@gmail.com',
    language: 'tr',
    avatar: 'ICONS/duck.png'
}

let user2 = {
  id: 2,
  username: 'dasdasd', 
  name: 'ayhan',
  surname: 'coskun',
  email: 'ayhan@gmail.com',
  language: 'en',
  avatar: 'ICONS/cat.png'
}


const COLORS = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  magenta: '#ff00ff',
  cyan: '#00ffff',
  black: '#000000'
}
let settigs = {
  ball_color: COLORS.red,
  background_color: COLORS.green,
  player_one_color: COLORS.blue,
  player_two_color: COLORS.yellow,
  language: 'tr'
}

app.post('/api/update/nickname', (req, res) => {
  console.log("nicaname güncelleme isteği: ", req.body);
  const nickname = req.body;
  console.log(nickname.data);
  console.log(`Yeni Takma Ad: ${nickname.data}`);
  // Burada takma ad güncelleme işlemleri yapılabilir
  res.json({ status: 'takma ad güncellendi', newNickname: nickname, token: '1234567890' });
});

app.post('/api/settings', (req, res) => {
  console.log(req.body);
});

app.get('/api/settings', (req, res) => {
  console.log("settings isteği: ", req.body);
  // Burada ayarları döndürebiliriz
  res.json(settigs);
});

app.post('/api/update/name', (req, res) => {
  console.log("name güncelleme isteği: ", req.body);
  const nickname = req.body;
  console.log(nickname.data);
  console.log(`Yeni Takma Ad: ${nickname.data}`);
  // Burada takma ad güncelleme işlemleri yapılabilir
  res.json({ status: 'takma ad güncellendi', newNickname: nickname, token: '1234567890' });
});


app.post('/api/update/email', (req, res) => {
  console.log("email güncelleme isteği: ", req.body);
  const nickname = req.body;
  console.log(nickname.data);
  console.log(`Yeni Takma Ad: ${nickname.data}`);
  // Burada takma ad güncelleme işlemleri yapılabilir
  res.json({ status: 'takma ad güncellendi', newNickname: nickname, token: '1234567890' });
});

app.post('/api/update/password', (req, res) => {
  console.log("pasword güncelleme isteği: ", req.body);
  const nickname = req.body;
  console.log(nickname.data);
  console.log(`Yeni Takma Ad: ${nickname.data}`);
  // Burada takma ad güncelleme işlemleri yapılabilir
  res.json({ status: 'takma ad güncellendi', newNickname: nickname, token: '1234567890' });
});


app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Kullanıcı Adı: ${username}, Şifre: ${password}`);
  if (username === '1' && password === '1') {
	res.json({ status: 'giriş başarılı', token: '1234567890', user: user });
  } else if (username === '2' && password === '2') {
    res.json({ status: 'giriş başarılı', token: '0987654321', user: user2 });
  }else {
	res.status(401).json({ status: 'giriş başarısız', token: null,  });
  }
});

app.post('/api/register', (req, res) => {
  const x = req.body;
  console.log(x);
  console.log(`Kullanıcı Adı: ${x.name}, Şifre: ${x.password}`);
  if (x.surname === 'hasnasln'){
	  res.status(409).json({ status: 'kullanıcı zaten var'});
  }
  // Burada kullanıcı kaydı işlemleri yapılabilir
  res.json({ status: 'kayıt başarılı', user: x });
});

app.post('api/update/name', (req, res) => {
  const { name } = req.body;
  console.log(`Yeni İsim: ${name}`);
  // Burada isim güncelleme işlemleri yapılabilir
  res.json({ status: 'isim güncellendi', newName: name });
});

app.get('/api/me', (req, res) => {
  // Burada kullanıcı bilgileri döndürülebilir
  console.log("istek geldi");
  res.json({ user: { 
    id: 1,
    username: 'hasnasln', 
    name: 'hasan',
    surname: 'aslan',
    email: 'hasnasln0207@gmail.com',
    language: 'tr',
    avatar: 'IMG/profile.jpg'} });
});

// Örnek POST isteği
app.post('/api/data', (req, res) => {
  console.log(req.body);
  res.json({ status: 'veri alındı', received: req.body });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});