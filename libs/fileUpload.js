var notificationDivTarget = document.body;

function miscUploadPolicy(mimeType, callback) {
  $.post("https://api.ense.nyc/upload",
  {
    "mimeType" : mimeType,
    deviceSecretKey : localStorage.deviceSecretKey
  }, callback);
}

function markFileAsDone(fileID, then) {
  $.post("https://api.ense.nyc/upload/done/" + fileID, {
    deviceSecretKey : localStorage.deviceSecretKey
  }, then);
}

function uploadSomeFile(fileObj, callback, progress) {
  miscUploadPolicy(fileObj.type, function(maybeUploadPolicy) {
    if(maybeUploadPolicy.tag == "Just") {
      var uploadPolicy = maybeUploadPolicy.contents;
      /*
        fileID: use to indicate upload completion
        filepath: append to "https://s3.amazonaws.com/media.ense.nyc/"
        policyDoc
        signature
      */
      blobForFile(fileObj, function(fileBlob) {
        var uploadBaseUrl = "https://s3.amazonaws.com/media.ense.nyc/";
        var formData = new FormData();
        formData.append("key", uploadPolicy.filepath);
        formData.append("acl", "public-read");
        formData.append("Content-Type", fileObj.type);
        formData.append("AWSAccessKeyId", "AKIAJGPMBNUIOKY2WMHA");
        formData.append("Policy", uploadPolicy.policyDoc);
        formData.append("Signature", uploadPolicy.signature)
        formData.append("file", fileBlob);
        var oReq = new XMLHttpRequest();
        oReq.open("POST", uploadBaseUrl, true);
        oReq.onload = function (oEvent) {
          if(oReq.status == 200 || oReq.status == 204) {
            markFileAsDone(uploadPolicy.fileID, function() {
              callback(uploadPolicy.fileID, uploadBaseUrl + uploadPolicy.filepath);
            });
            
          }
          // Uploaded.
        };
        
        if(oReq.upload && typeof progress == "function") {
          oReq.upload.onprogress = function(ev) {
            progress(ev);
          }
        }
        oReq.send(formData);
      });
    }
  });
}

function uploadFile(fileBlob, mimetype, uploadKey, policyBundle, callback, progress) {
    var uploadBaseUrl = "https://s3.amazonaws.com/media.ense.nyc/";
    
    var formData = new FormData();
    formData.append("key", uploadKey);
    formData.append("acl", "public-read");
    formData.append("Content-Type", mimetype);
    formData.append("AWSAccessKeyId", "AKIAJGPMBNUIOKY2WMHA");
    formData.append("Policy", policyBundle.policyDoc);
    formData.append("Signature", policyBundle.signature)
    formData.append("file", fileBlob);

    var oReq = new XMLHttpRequest();
    oReq.open("POST", uploadBaseUrl, true);
    oReq.onload = function (oEvent) {
      if(oReq.status == 200 || oReq.status == 204)
        callback(uploadBaseUrl + uploadKey);
      // Uploaded.
    };
    
    if(oReq.upload && typeof progress == "function") {
      oReq.upload.onprogress = function(ev) {
        progress(ev);
      }
    }
    oReq.send(formData);
}

function blobForFile(file, blobHandler) {
  var reader = new FileReader();
  reader.onload = (function(theFile) {
    return function(e) {
      var theBlob = new Blob([reader.result])
      blobHandler(theBlob, theFile);
    }
  })(file);
  reader.readAsArrayBuffer(file);
}

function randElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateColorCode() {
  var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
  return randElem(colors) + randElem(colors) + randElem(colors);
}

function uploadNewEnseWithBlob(audioBlob, enseID, filename, filetype, delayRelease, unlisted, callback, progressBar, title) {

  $.post("https://api.ense.nyc/ense/" + enseID, { mimeType :filetype, deviceKey: localStorage.deviceSecretKey, userAgent: 'ProducerConsole', delayRelease : delayRelease, unlisted : unlisted },
    function(enseCreationResult) {
    //enseCreationResult.
    ////dbKey -> number
    ////uploadKey -> path to use for uploadin
    ////policyBundle
    //////policyDoc - base64 encoded policy
    //////signature - base64 encoded signature
    console.log(enseCreationResult);
    if(enseCreationResult.tag == "Just") {
      uploadFile(audioBlob, filetype, enseCreationResult.contents.uploadKey, enseCreationResult.contents.policyBundle,
        function(uploadedFileUrl) {
          console.log(uploadedFileUrl);
          $.post('https://api.ense.nyc/ense/' + enseID + '/' + enseCreationResult.contents.dbKey,
              {
                fileUrl : uploadedFileUrl,
                unlisted : unlisted,
                author : "",
                title : title
              },
              function(data) {
                  console.log("success");
                  if(progressBar) {
                    $(".progress-bar",progressBar).addClass("progress-bar-success");
                  }
                  if (callback) {
                      callback({
                          key: enseCreationResult.contents.dbKey,
                          handle: enseID,
                          enseAudioUrl: uploadedFileUrl,
                          url: "/ense/" + enseCreationResult.contents.dbKey + "/" + enseID,
                          filename : filename
                      })
                  }
               });
        },
        function(ev) {
          if(ev.lengthComputable) {
            /*$(".progressBar", newDiv).css({
              width : (100 * ev.loaded / ev.total) + "px"
            });*/
            if(progressBar) {
              progressBar.updatePercent(100 * ev.loaded / ev.total);
            }
          }
        }
      );
    }
  });
}


function uploadAudioFiles(files, delayRelease=true, unlisted=true, andThen) {
   for (var i = 0, f; f = files[i]; i++) {
      console.log(files[i]);
      if(!files[i].uploadInProgress) {
        if(files[i].type.match('audio.*') || files[i].type.match('video/mp4')) {
          files[i].uploadInProgress = true;
          blobForFile(f, function(audioBlob, theFile) {
            uploadNewEnseWithBlob(audioBlob, generateColorCode(), theFile.name, theFile.type, delayRelease, unlisted, andThen, theFile.progressBar);

          });
        }
      }
    }
}