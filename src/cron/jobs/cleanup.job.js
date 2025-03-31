import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteOldFiles = () => {
  try {
    const uploadsDir = path.join(__dirname, '../../../uploads');
    const files = fs.readdirSync(uploadsDir);

    for (const file of files) {
      if (file !== 'doNotDelete.txt') {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error deleting old files:', error);
    throw new Error('Error deleting old files');
  }
}

const cleanupJob = async () => {
  try {
    deleteOldFiles();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup job failed:', error);
  }
};

export default cleanupJob;