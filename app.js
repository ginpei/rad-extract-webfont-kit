const express = require('express');
const fs = require('fs');
const misc = require('./src/misc');
const multer  = require('multer');

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

app.get('/', (req, res) => {
  const content = fs.readFileSync('views/index.html', 'utf8').toString();
  res.send(content);
});

app.post('/fonts/upload', kitUpload, (req, res) => {
  const kit = req.files['webfont-kit'][0];
  console.log('# kit', kit);

  misc.extractFontFiles(kit.path, (error) => {
    if (error) {
      console.error(error);
      res.status(500);
      res.send(error.message);
      return;
    }

    res.send('OK');
  });
});

app.listen(port, () => process.stdout.write(`# Listening on ${port}\n`));
