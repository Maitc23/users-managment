const multer = require('multer');
const uuid = require('uuid');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + path.extname(file.originalname));
    }
})


// Multer Filter
const multerFilter = (req, file, cb) => {
    //Regular expresion to filter allowed file types
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);

    //We verify the extension 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    //If the file is correct we accept the file
    if (mimetype && extname) {
        return cb(null, true);
    }

    return cb(({
        success: false,
        message: 'Error: file type is not supported ' + filetypes
    }), false)

};

//Multer obj
const multerObj = {
    storage: storage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB (modify the size limit as needed)
    }
}


//Upload obj
const upload = multer(multerObj).single('file');


//Function to upload the file
const uploadFile = (req, res, next) => {
    //Upload the file
    upload(req, res, function (error) {
        if (error) { //instanceof multer.MulterError
            res.status(500);
            if (error.code == 'LIMIT_FILE_SIZE') {
                error.message = 'File Size is too large. Allowed file size';
                error.success = false;
            }
            console.log(error)
            return res.json(error);
        } else {
            next()
        }
    })
};



module.exports = uploadFile


