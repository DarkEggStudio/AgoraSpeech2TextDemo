//
// AccountManager.js
// 2024.02.23
// by Hu Yuhua
//
import axios from 'axios'

class AccountManager {
  loginUrl = ''
  currentAccount = ref({'id': 'abc'})

  async login(username, password) {
    console.debug("Call login API.")
    const data = {
      'username': username,
      'password': password
    }
    console.debug(data); 
    // call api
    const headers = {
      'content-type': 'application/json',
    }
    axios.post(this.loginUrl, data, {headers: headers}).then((res) => {
      if (res.status == '200') {
        // login success
        console.warn(`Login success: ${res.status}, ${res.data}`)
      } else {
        // login failed
        console.warn(`Login failed: ${res.status}, ${res.data}`)
      }
    }).catch(error => {
      console.warn(`Login api error: ${error}`)
    })
    return ''
  }
}

// default export
let accountMgr = (new AccountManager())
export default accountMgr

/// Account storage
class AccountStorage {
  selfAccountId = 'Test'
}

import { ref } from 'vue'

let accountStorage = ref(new AccountStorage())
export {accountStorage}