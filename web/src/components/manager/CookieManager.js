class CookieManager {
  saveToCookie(key, object) {
    const jsonStr = JSON.stringify(object)
    console.debug(`key is ${jsonStr}`)
    // $cookie.set(key, jsonStr)
  }

  loadFromCookie(key) {
    return {'temp': 'test value'}
  }
}

let cookieMgr = new CookieManager()
export default cookieMgr
