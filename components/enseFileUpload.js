
//adapted/cleaned up from EnseWidget
//only file upload stuff is in here
var enseFileUpload = new function () {

  var self = this

  this.init () {
    if (typeof localStorage.deviceSecretKey === 'undefined') {
      localStorage.deviceSecretKey = randomStr(64)
      $.post({
        url: 'https://api.ense.nyc/device/register',
        data: { deviceSecretKey: localStorage.deviceSecretKey },
        async: false
      })
    }
  }

  this.uploadAudio = function ({fileBlob, handle, file, unlisted, title}, callback) {
    uploadNewEnseWithBlob(encodedBlob, generateColorCode(), '', 'audio/mp3', false, unlisted, callback, undefined, title)
  }


  function uploadNewEnseWithBlob (audioBlob, enseID, filename, filetype, delayRelease, unlisted, callback, progressBar, title) {
    $.post('https://api.ense.nyc/ense/' + enseID, { mimeType: filetype, deviceKey: localStorage.deviceSecretKey, userAgent: 'ProducerConsole', delayRelease: delayRelease, unlisted: unlisted },
        function (enseCreationResult) {
        // enseCreationResult.
        /// /dbKey -> number
        /// /uploadKey -> path to use for uploadin
        /// /policyBundle
        /// ///policyDoc - base64 encoded policy
        /// ///signature - base64 encoded signature
          console.log(enseCreationResult)
          if (enseCreationResult.tag == 'Just') {
            uploadFile(audioBlob, filetype, enseCreationResult.contents.uploadKey, enseCreationResult.contents.policyBundle,
            function (uploadedFileUrl) {
              console.log(uploadedFileUrl)
              $.post('https://api.ense.nyc/ense/' + enseID + '/' + enseCreationResult.contents.dbKey,
                {
                  fileUrl: uploadedFileUrl,
                  unlisted: unlisted,
                  author: '',
                  title: title
                },
                  function (data) {
                    console.log('success')
                    if (progressBar) {
                      $('.progress-bar', progressBar).addClass('progress-bar-success')
                    }
                    if (callback) {
                      callback({
                        key: enseCreationResult.contents.dbKey,
                        handle: enseID,
                        enseAudioUrl: uploadedFileUrl,
                        url: '/ense/' + enseCreationResult.contents.dbKey + '/' + enseID,
                        filename: filename
                      })
                    }
                  })
            },
            function (ev) {
              if (ev.lengthComputable) {
                /* $(".progressBar", newDiv).css({
                  width : (100 * ev.loaded / ev.total) + "px"
                }); */
                if (progressBar) {
                  progressBar.updatePercent(100 * ev.loaded / ev.total)
                }
              }
            }
          )
          }
        })
  }

  function randomStr (length) {
    var i
    var charset = '0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
    var randstr = ''
    for (i = 0; i < length; i++) {
      randstr = randstr + charset[Math.floor(Math.random() * charset.length)]
    }
    return randstr
  }

  function randElem (arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  function generateColorCode () {
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
    return randElem(colors) + randElem(colors) + randElem(colors)
  }
}

function tagEnseWithHandle (enseKey, enseHandle, userhandle, andThen) {
  $.get('https://api.ense.nyc/accounts/handle/' + userhandle, {}, function (handledata) {
    var userkey = parseInt(handledata.publicAccountId)
    var deltas = { deltas: [ {
      UpsertAtTag: {
        userId: userkey
      }
    }]}
    $.ajax('https://api.ense.nyc/attags/' + enseHandle + '/' + enseKey, {
      method: 'POST',
      data: {
        deviceSecretKey: localStorage.deviceSecretKey,
        deltas: JSON.stringify(deltas)
      },
      complete: function () {
        if (andThen) {
          andThen()
        }
      }
    })
  })
}

export {
  enseFileUpload,
  tagEnseWithHandle
}