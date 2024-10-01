import {promises as fs} from 'fs';
import {Coordinates} from './types';

const filename = './db.json';
let data: Coordinates[] = [];

const fileDb = {
  async init() {
    try {
      const fileContents = await fs.readFile(filename);
      data = JSON.parse(fileContents.toString());
    } catch (e) {
      data = [];
    }
  },
  async getItems() {
    return data;
  },
  async removeItems() {
    data=[]
    await this.save();
    return;
  },
  async addItem(item: Coordinates[]) {
    const coordinates: Coordinates[] = [...item];
    data.push(...coordinates);
    await this.save();
    return;
  },
  async save() {
    return fs.writeFile(filename, JSON.stringify(data, null, 2));
  }
};

export default fileDb;