import multer from 'multer';
import path from 'path';

// Configure file storage
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

// Initialize the upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
