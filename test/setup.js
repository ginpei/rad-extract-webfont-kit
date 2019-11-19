const chai = require('chai');
const fs = require('fs');
const path = require('path');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

if (!fs.existsSync(path.join(__dirname, 'assets/fontsquirrel.zip'))) {
  throw new Error('Test assets are not ready. Find setup in README');
}
