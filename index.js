const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const port = process.env.PORT || 3000;


const app = express();

// Define the static files directory
const staticFilesDirectory = path.join(__dirname, 'static');

// Create a storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { username } = req.params;
    const userStaticDirectory = path.join(staticFilesDirectory, username);
    console.log(userStaticDirectory);
    fs.mkdirSync(userStaticDirectory, {recursive: true});
    cb(null, userStaticDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Create an instance of multer with the storage engine
const upload = multer({ storage });


// Define a route for uploading the zip file
app.post('/:username/upload', upload.single('file'), (req, res) => {
  res.status(200).send('File uploaded successfully');
});

// Define a route for serving the user-specific static files
app.use('/:username', (req, res) => {
  console.log("param hit");
  const { username } = req.params;
  const userStaticDirectory = path.join(staticFilesDirectory, username);
  if (fs.existsSync(userStaticDirectory)) {
    express.static(userStaticDirectory)(req, res);
  } else {
    res.status(404).send('User not found');
  }
} );

// Error-handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message || 'Internal Server Error');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
