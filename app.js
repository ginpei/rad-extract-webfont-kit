const express = require('express');
const fs = require('fs');
const misc = require('./src/misc');
const multer  = require('multer');
const path = require('path');

if (!process.version.startsWith('v4.')) {
  console.warn('Node.js v4 is expected.'); // hope we would upgrade
}

const port = process.env.PORT || 3000;

const app = express();
const upload = multer({ dest: 'tmp/' });
const kitUpload = upload.fields([
  {
    maxCount: 1,
    name: 'webfont-kit',
  },
]);

app.use('/', express.static('public'));

app.get('/', (req, res) => {
  const content = fs.readFileSync('views/index.html', 'utf8').toString();
  res.send(content);
});

app.post('/fonts/upload', kitUpload, (req, res) => {
  const fontsDir = path.join(__dirname, 'public/uploads/fonts/');
  const kit = req.files['webfont-kit'][0];
  misc.extractFontKit(kit.path, fontsDir, (error) => {
    if (error) {
      res.status(500);
      res.send(error.message);
      return;
    }

    res.send('OK');
  });
});

app.listen(port, () => process.stdout.write(`# Listening on ${port}\n`));
