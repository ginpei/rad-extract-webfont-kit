const express = require('express');
const fs = require('fs');
const multer  = require('multer');
const yauzl = require("yauzl");

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
  const content = fs.readFileSync('routes/index.html', 'utf8').toString();
  res.send(content);
});

app.post('/fonts/upload', kitUpload, (req, res) => {
  const kit = req.files['webfont-kit'][0];
  console.log('# kit', kit);

  if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
  }
  if (!fs.existsSync('tmp/fonts')) {
    fs.mkdirSync('tmp/fonts');
  }

  yauzl.open(kit.path, { lazyEntries: true }, (err, zipfile) => {
    if (err) {
      res.status(500);
      res.send('Failed to open zip');
    }

    zipfile.readEntry();
    zipfile.on('entry', (entry) => {
      const fileName = entry.fileName;
      console.log('# file', fileName);

      if (/\.ttf$/.test(fileName)) {
        const posLastDelimiter = fileName.lastIndexOf('/');
        const fontFileName =
          posLastDelimiter < 0
            ? fileName
            : fileName.slice(posLastDelimiter + 1);
        const buffer = entry.extraFields.data;
        try {
          fs.writeFileSync(`tmp/fonts/${fontFileName}`, buffer);
        } catch (error) {
          console.error(error);
          res.status(500);
          res.send('Failed to extract files');
          return;
        }
      }

      // next
      zipfile.readEntry();
    });
    zipfile.on('end', () => {
      res.status(200);
      res.send('OK');
    });
  });
});

app.listen(port, () => process.stdout.write(`# Listening on ${port}\n`));
