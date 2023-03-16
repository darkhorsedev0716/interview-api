const multer = require('multer'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});
var s3 = new aws.S3();
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            console.log(file);
            let extension = file.originalname.split(".")
            let filename = ""
            if(extension.length > 1){
                filename = `${Date.now()}_${file.originalname}`
            }else{
                filename = `${Date.now()}_${file.originalname}.mp4`
            }
            cb(null, filename); //use Date.now() for unique file keys
        }
    })
});
module.exports = upload