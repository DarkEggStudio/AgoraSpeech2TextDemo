class Logger {
  logLevel = import.meta.env.MODE

  typeStr(type) {
    switch (type) {
      case LogType.Info :
        return 'INFO'
      case LogType.Debug :
        return 'DEBUG'
      case LogType.Warning :
        return 'WARNING'
      case LogType.Error :
        return 'ERROR'
      default: 
        return 'INFO'
    }
  }

  typeFunc(type) {
    switch (type) {
      case LogType.Info :
        return console.info
      case LogType.Debug :
        return console.debug
      case LogType.Warning :
        return console.warn
      case LogType.Error :
        return console.error
      default: 
      return console.debug
    }
  }

  log(type, ...msg) {
    let typeStr = this.typeStr(type)
    let typeFunc = this.typeFunc(type)
    if (this.logLevel == 'development') {
      typeFunc(`[${typeStr}]: ${msg.join('')}`)
    }
    else {
      if (type >= LogType.Warning) {
        typeFunc(`[${typeStr}]: ${msg.join('')}`)
      }
    }
  }
}

export { LogType }
const LogType = {
  Debug: 1,
  Info: 2,
  Warning: 3,
  Error: 4
}

let logger = (new Logger())
export default logger
