var apiURL = 'https://api.ense.nyc';
var api_key = '6Vqgw5uxg+vuryVdgsmD9LUxW/edEH1nkwpj81hbpi8=';

function sendPostSingleParam(toURL, key, value, callback) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open("POST", toURL)
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE) {
        let fn = callback || resolve
        fn(xhr.responseText)
      }
    }
    xhr.addEventListener('error', (error) => {
      reject(error)
    })
    xhr.send(encodeURIComponent(key) + "=" +
             encodeURIComponent(value))
  })
}

// URL-encode data
function encodeData(data = {}) {
  const cmps = []
  for (const key in data) {
    cmps.push(
      encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
    )
  }
  return cmps.join('&')
}
// Parse response if it's json
function parseResponse(response) {
  if (!response.ok) {
    throw new Error(response.status)
  }
  const contentType = response.headers.get('Content-Type')
  return /json/.test(contentType) ? response.json() : response.text()
}

// Handles making a request: encodes the payload and parses the response.
// Takes a callback but returns a promise
function makeRequest(route, request = {}, payload = {}, callback) {
  request.headers = request.headers || {}

  const reqData = encodeData(payload)
  let url = `${apiURL}/${route}`
  if (request.method === 'GET' && reqData) {
    url += '?' + reqData
  } else if (request.method === 'POST' || request.method === 'DELETE') {
    request.body = reqData
    if (!request.headers['Content-Type']) {
      // TODO: Do type check on payload and use
      // form data content-type if applicable
      request.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
  }
  
  return fetch(url, request)
  .then(parseResponse)
  .then((data) => {
    if (typeof data === 'object' && data.tag) {
      if (data.tag === 'Just') {
        data = data.contents
      } else if (data.tag === 'Nothing') {
        data = null
      }
    }
    if (callback) {
      callback(null, data)
    }
    return data
  })
  .catch((error) => {
    if (callback) {
      callback(error)
    }
    return Promise.reject(error)
  })
}

const RouteByListTypeMap = {
  feed: '/',
  user: '/channel/',
  story: '/topics/'
}

const EnseAPI = {

  getFollowersAndFollowing: function(handle) {
    return makeRequest(
      `/accounts/followingfollowers/${handle}`,
      {
        method: 'GET'
      }
    )
  },

  getUserEnseCountByHandle: function(handle) {
    return makeRequest(
      `/accounts/utils/userEnseCount/${handle}`,
      {
        method: 'GET'
      }
    )
  },

	searchTopicsWithTerm: function(term) {
    return makeRequest(
      `/topics/utils/search/${term}%`,
      {
        method: 'GET'
      }
    )
	},

	searchAccountsWithTerm: function(term) {
    return makeRequest(
      `/accounts/utils/search/${term}%`,
      {
        method: 'GET'
      }
    )
	},

  getEnseReuploadBundle: function(handle, key, version, mimeType) {
    return makeRequest(
      `/ense/${handle}/${key}/${version}`,
      {
        method: 'GET'
      },
      {
        mimeType
      }
    )
  },

  updateEnseAudioVersion: function(deviceSecretKey, handle, key, audioVersion) {
    return EnseAPI.updateEnse(
      deviceSecretKey, handle, key, { audioVersion }
    )
  },

  updateEnseFileUrl: function(deviceSecretKey, handle, key, fileUrl) {
    return EnseAPI.updateEnse(
      deviceSecretKey, handle, key, { fileUrl }
    )
  },

  uploadEnse: function(handle, params) {
    return makeRequest(
      `/ense/${handle}`,
      {
        method: 'POST'
      },
      params
    )
  },

  incrementPlayCount: function(deviceSecretKey, enseKey) {
    return makeRequest(
      `/enseViews/new/${enseKey}`,
      {
        method: 'POST'
      },
      {
        deviceSecretKey
      }
    )
  },

	registerPushToken: function(deviceSecretKey, info) {
    return makeRequest(
      `/device/pushtoken`,
      {
        method: 'POST'
      },
      {
        ...info,
        deviceSecretKey
      }
    )
	},

  registerDevice: function() {
    return makeRequest(
      '/device/register',
      {
        method: 'POST'
      },
      {
        api_key
      }
    )
  },

  fetchExploreFeeds: function() {
    return makeRequest(
      '/explore',
      {
        method: 'GET'
      }
    )
  },

  fetchAccountById: function(id) {
    return makeRequest(
      `/accounts/info/${id}`,
      {
        method: 'GET'
      }
    )
  },

  fetchAccountByHandle: function(handle) {
    return makeRequest(
      `/accounts/handle/${handle}`,
      {
        method: 'GET'
      }
    )
  },

  getOrUpdateSubscriptions: function(deviceSecretKey, payload = {}) {
    payload.deviceSecretKey = deviceSecretKey
    return makeRequest(
      `/subscriptions`,
      {
        method: 'POST'
      },
      payload
    )
  },

  fetchSubscriptions: function(deviceSecretKey, params = {}) {
    const query = {
      count: 10,
      ...params
    }
    const qs = encodeData(query)
    return makeRequest(
      `/subscriptions/feed?${qs}`,
      {
        method: 'POST'
      },
      {
        deviceSecretKey
      }
    )
  },

  fetchCurrentUserEnses: function(deviceSecretKey, params = {}) {
    const query = {
      count: 10,
      ...params
    }
    const qs = encodeData(query)
    return makeRequest(
      `/accounts/myEnses?${qs}`,
      {
        method: 'POST'
      },
      {
        deviceSecretKey
      }
    )
  },

  fetchEnsesByDevice: function(device, params = {}) {
    return makeRequest(
      `devices/enses/${device}`,
      {
        method: 'GET'
      },
      {
        count: 10,
        ...params
      }
    )
  },

  fetchEnses: function(deviceSecretKey, info, params = {}) {
    params = {
      count: 10,
      ...params
    }
    if (info.method === 'POST') {
      const queryParams = encodeData(params)
      return makeRequest(
        `${info.url}?${queryParams}`,
        {
          method: 'POST'
        },
        {
          deviceSecretKey
        }
      )
    } else {
      return makeRequest(
        info.url,
        {
          method: 'GET'
        },
        params
      )
    }
  },

  getUploadKeys: function(deviceSecretKey, mimeType) {
    return makeRequest(
      `/upload`,
      {
        method: 'POST',
      },
      {
        deviceSecretKey, mimeType
      }
    )
  },

  notifyUploadComplete: function(deviceSecretKey, fileId) {
    return makeRequest(
      `/upload/done/${fileId}`,
      {
        method: 'POST'
      },
      {
        deviceSecretKey
      }
    )
  },

  // Link a third-party account by passing along OAuth Echo headers.
  // This route is currently used by Twitter + Digits only.
  linkAccount: function(deviceSecretKey, provider, headers = {}) {
    provider = provider.toLowerCase()
    if (provider !== 'twitter' && provider !== 'digits') {
      throw new Error('Unknown OAuth Echo provider.')
    }

    return makeRequest(
      `/verify/OAuth/${provider}`,
      {
        method: 'POST',
        headers
      },
      {
        deviceSecretKey
      }
    )
  },

  getOrUpdateAccountInfo(deviceSecretKey, update = {}) {
    const payload = {
      ...update,
      deviceSecretKey
    }
    return makeRequest(
      '/accounts/info',
      {
        method: 'POST'
      },
      payload
    )
  },

  setHandleForAccount(deviceSecretKey, newHandle) {
    return makeRequest(
      `/accounts/handle`,
      {
        method: 'POST'
      },
      {
        deviceSecretKey,
        newHandle
      }
    )
  },

  getAccountForDevice: function(deviceSecretKey) {
    return makeRequest(
      '/accounts/info',
      {
        method: 'POST'
      },
      {
        deviceSecretKey
      }
    )
  },

  updateStories: function(deviceSecretKey, handle, key, deltas, callback) {
    const payload = {
      deviceSecretKey,
      deltas: JSON.stringify({
        deltas
      })
    }

    return makeRequest(
      `/topics/${handle}/${key}`,
      {
        method: 'POST'
      },
      payload,
      callback
    )
  },

  addTag : function addTag(deviceSecretKey, handle, key, name, email, callback) {
    const update = {
      deltas: [{ UpsertTag: { name, email }}]
    }
    const payload = {
      deviceSecretKey,
      deltas: JSON.stringify(update)
    }
    return makeRequest(
      `/tags/${handle}/${key}`,
      {
        method: 'POST'
      },
      payload,
      callback
    )
  },

  updateEnse: function(deviceSecretKey, handle, key, update = {}, callback) {
    const payload = {
      ...update,
      deviceSecretKey
    }
    return makeRequest(
      `/ense/${handle}/${key}`,
      {
        method: 'POST'
      },
      payload,
      callback
    )
  },

  deleteEnse: function(deviceSecretKey, handle, key) {
    const payload = deviceSecretKey ? { deviceSecretKey } : {}
    return makeRequest(
      `/ense/${handle}/${key}`,
      {
        method: 'DELETE'
      },
      payload,
    )
  },

  updateSingleField : function(deviceSecretKey, handle, key, fieldName, text, callback) {
    const update = {
      [fieldName]: text
    }
    return this.updateEnse(deviceSecretKey, handle, key, update, callback)
  },

  setUnlisted : function(deviceSecretKey, handle, key, flag, callback) {
    const update = {
      unlisted: (flag == true).toString()
    }
    return this.updateEnse(deviceSecretKey, handle, key, update, callback)
  },

  setTopics : function(deviceSecretKey, handle, key, topicString, callback) {
    const update = {
      author: topicString
    }
    return this.updateEnse(deviceSecretKey, handle, key, update, callback)
  },

  getEnseInfo : function(handle, key, callback) {
    return new Promise((resolve, reject) => {
      var toURL = apiURL + '/ense/' + handle + '/' + key;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", toURL);
      xhr.onreadystatechange = function () {
        try {
          if(xhr.readyState === XMLHttpRequest.DONE) {
            var responseObj = JSON.parse(xhr.responseText);
            if(responseObj.tag == "Just") {
              let fn = callback || resolve
              fn(responseObj.contents)
            } else {
              fn()
              //callback();
            }
          }
        } catch (e) {
          reject(e)
        }
      };
      xhr.send();
    })
  },

  verifyEmail: function(email, deviceId) {
    if (!email) { throw 'No Email Provided' }
    if (!deviceId) { throw 'No Device Id Provided' }
    return fetch(`${apiURL}/verify/${email}/${deviceId}`)
  },

  checkIfVerified: function(deviceId) {
    if (!deviceId) { throw 'No Device Id Provided' }
    return fetch(`${apiURL}/accounts/checkVerified/${deviceId}`)
      .then(response => response.json())
  },

  checkNameAvailability: function(usernameToCheck) {
    if (!usernameToCheck) { throw 'No Username Provided' }
    return fetch(`${apiURL}/accounts/checkName/${usernameToCheck}`)
      .then(response => response.json())
  },

  getUsernameForEmail: function(email) {
    if (!email) { throw 'No Email Provided' }
    return fetch(`${apiURL}/accounts/checkEmail/${email}`)
      .then(response => response.json())
  },

  createAccount: function(deviceId, username) {
    if (!deviceId) { throw 'No Device Id Provided' }
    if (!username) { throw 'No Username Provided' }
    return fetch(`${apiURL}/accounts/create/${deviceId}/${username}`, {
      method: 'POST'
    }).then(response => response.json())
  },

  handleAndKeyFromWeblink : function(weblink){
   var qIndex = weblink.indexOf("?");
   if(qIndex == -1) {
     var pathParts = weblink.split("/");
     var handle = pathParts.pop();
     var key = pathParts.pop();
     return {handle, key};
   } else {
     var parts = weblink.substring(qIndex+1).split("&");
     var props = {};
     parts.forEach((part) => {
       var kv = part.split("=");
       props[kv[0]] = kv[1];
     });
     return {
       handle : props["handle"],
       key : props["key"]
     };
   }
 }
}

module.exports = { EnseAPI };

