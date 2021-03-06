const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('../image-resizer/ffmpeg.js');
// const resizer = require('../image-resizer/resizer.js')
require('dotenv').load();
const watson = require('watson-developer-cloud');
const resizer = require('../image-resizer/resizer');


// router.get('/dontUSE', ()=>{
//   // var key = require('./auth');
//
//   // visual_recognition.listClassifiers({},
//   //   function(err, response) {
//   //     if (err)
//   //     console.log(err);
//   //     else
//   //     console.log(JSON.stringify(response, null, 2));
//   //   }
//   // );
//
// })

// function IBMClassify(filepath){
//
//   return setTimout(response, 5000);
// }
router.post('/:endpoint', (req,res,next)=>{

  let endpoint = req.params.endpoint;
  const imgdata = req.body.data;
  var imgpath = path.join(process.cwd(), '/temp/userimg.jpg')
  // const imgpath = './temp/userimg.jpg'
  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
  console.log('WRITEFILE', imgpath, typeof imgpath);

  fs.writeFile('userimg.jpg', base64Data, 'utf8', (err, suc) => {
    const filePathsToResize = [imgpath] // it can be just one, but still has to be an array, you can give it all of your images, it will just spit out images that are already below the configured max size (2MB) without doing any processing, so no need to check on your end
    // const Resizer = new resizer.Resizer(filePathsToResize)
    // // use the Resizer.resize() method as a simple promise
    // Resizer.resize().then((filePaths) => {
    //  console.log('FILEPATHS POST RESIZER', filePaths) // paths to the resized images
     var params = {
        images_file: fs.createReadStream(filePathsToResize),
        'classifier_ids':[`${endpoint}`]
      }
      var visual_recognition = watson.visual_recognition({
        api_key: process.env.WATSON_API,
        version: 'v3',
        version_date: '2016-05-19',
      })
      visual_recognition.classify(params, function(err, response) {
        if (err)
        console.log('error', err);
        else
        console.log(JSON.stringify(response, null, 2))
        var resultTemp= [];
        let classesResponse = response.images[0].classifiers[0].classes;
        classesResponse.forEach(el=>{
          if(el.score > .60){
            resultTemp.push(el)
          }
        })
        let result = JSON.stringify(resultTemp, null, 2)
        res.send(result)
      })
    // }).catch((error) => {
    //  console.log('error 2', error);
  //  })//END OF CATCH STATEMENT OF RESIZE
 })//END OF WRITE FILE
})//END OF POST



module.exports = router;
