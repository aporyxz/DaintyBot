const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Created data directory');
}

const storage = {
  read(filename) {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    try {
      if (!fs.existsSync(filePath)) {
        return {};
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return {};
    }
  },

  write(filename, data) {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  },

  append(filename, key, value) {
    const data = this.read(filename);
    data[key] = value;
    return this.write(filename, data);
  },

  get(filename, key) {
    const data = this.read(filename);
    return data[key] || null;
  },

  delete(filename, key) {
    const data = this.read(filename);
    delete data[key];
    return this.write(filename, data);
  },

  has(filename, key) {
    const data = this.read(filename);
    return key in data;
  },

  keys(filename) {
    const data = this.read(filename);
    return Object.keys(data);
  }
};

module.exports = storage;
