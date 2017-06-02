import Recorder from 'recorderjs' //'./recorder3''

var EnseWidget = new function() {
    if(typeof makeMp3Blob == "undefined") {
        console.error("Ense version of Mp3LameEncoder not loaded");
        return;
    }
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    var self = this;

    var mostRecentMessage = null;

    var audioContext = new AudioContext();
    var audioInput = null,
        realAudioInput = null,
        inputPoint = null,
        audioRecorder = null,
        recording = false,
        encodedBlob = null,
        analyserNode = null,
        zeroGain = null


    function markFileAsDone(fileID, then) {
      $.post("https://api.ense.nyc/upload/done/" + fileID, {
        deviceSecretKey : localStorage.deviceSecretKey
      }, then);
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

    function randElem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateColorCode() {
      var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
      return randElem(colors) + randElem(colors) + randElem(colors);
    }

    function randomStr(length) {
        var i;
        var charset = "0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";
        var randstr = "";
        for(i = 0; i < length; i ++) {
            randstr = randstr + charset[Math.floor(Math.random() * charset.length)];
        }
        return randstr;
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

    function gotStream(stream) {
        inputPoint = audioContext.createGain();

        // Create an AudioNode from the stream.
        realAudioInput = audioContext.createMediaStreamSource(stream);
        audioInput = realAudioInput;
        audioInput.connect(inputPoint);

    //    audioInput = convertToMono( input );

        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        inputPoint.connect( analyserNode );

        audioRecorder = new Recorder( inputPoint );

        zeroGain = audioContext.createGain();
        zeroGain.gain.value = 0.0;
        inputPoint.connect( zeroGain );
        zeroGain.connect( audioContext.destination );
    }

    function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

        navigator.getUserMedia({
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
    }    

    this.initialize = function() {
        initAudio();
        if(typeof(localStorage.deviceSecretKey) == "undefined") {
            localStorage.deviceSecretKey = randomStr(64);
            $.post({
                url : "https://api.ense.nyc/device/register",
                data : { deviceSecretKey : localStorage.deviceSecretKey },
                async: false
            });
        }
    }

    this.startRecording = function() {
        if(recording) return;
        recording = true;
        audioRecorder.clear();
        encodedBlob = null;
        audioRecorder.record();
    }

    this.stopRecording = function() {
        recording = false;
        audioRecorder.stop();
    }

    this.encodeRecording = function(callback) {
      audioRecorder.getBuffer(function(buffers) {
          encodedBlob = makeMp3Blob(buffers[0], audioContext.sampleRate);
          callback(encodedBlob);
      });      
    }

    this.getDataURL = function(callback) {
      if(encodedBlob != null) {
          var reader = new window.FileReader();
          reader.readAsDataURL(encodedBlob);
          reader.onloadend = function() {
            callback(reader.result);
          }
        } else {
          self.encodeRecording(function(blob) {
            self.getDataURL(callback);
          });
        }
    }    

    this.uploadRecording = function(title, unlisted, callback) {
        if(encodedBlob != null) {
          uploadNewEnseWithBlob(encodedBlob, generateColorCode(), "", "audio/mp3", false, unlisted, callback, undefined, title);
        } else {
          self.encodeRecording(function(blob) {
            uploadNewEnseWithBlob(blob, generateColorCode(), "", "audio/mp3", false, unlisted, callback, undefined, title);
          });
        }
    }

}();

//JK: add tagEnseWithStory
function tagEnseWithHandle(enseKey, enseHandle, userhandle, andThen) {
    $.get("https://api.ense.nyc/accounts/handle/" + userhandle, {}, function(handledata) {
        var userkey = parseInt(handledata.publicAccountId);
        var deltas = { deltas : [ {
            UpsertAtTag : {
                userId : userkey
            }
        }]}
        $.ajax("https://api.ense.nyc/attags/" + enseHandle + "/" + enseKey, {
            method : "POST",
            data : {
                deviceSecretKey : localStorage.deviceSecretKey,
                deltas : JSON.stringify(deltas)
            },
            complete : function() {
                if(andThen) {
                    andThen();
                }
            }
        });
    });
}


export { EnseWidget }
export { tagEnseWithHandle }


