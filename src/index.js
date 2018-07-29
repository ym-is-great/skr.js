const clone = require('lodash.clonedeep')
const set = require('lodash.set')
const get = require('lodash.get')

const typeList = ['number', 'boolean', 'string']
const transformList = ['nullable', 'toTimeString', 'toDateString', 'toTimestamp', 'toArray']

let source = null

const filter = (object, payload) => {
  if (payload.accept) {
    for (let key in object) {
      !payload.accept.includes(key) && (delete object[key])
    }
  } else if (payload.reject) {
    payload.reject.forEach(key => {
      delete object[key]
    })
  }
  return object
}

const parseRules = (string) => {
  const slices = string.split('|')
  let rules = []
  slices.forEach(item => {
    const array = item.split(':')
    if (typeList.includes(array[0])) {
      rules.push({ action: 'convert', payload: array[0] })
    } else if (transformList.includes(array[0])) {
      rules.push({ action: 'transform', method: array[0], payload: array[1] || null })
    } else {
      rules.push({ action: array[0], payload: array[1] || null })
    }
  })
  console.log('rules: ', rules)
  return rules
}

const nullable = (string) => {
  return string !== '' ? string : null
}

const toTimeString = (timestamp) => {
  let string = String(timestamp)
  const regex = /^\d{10,13}$/
  if (regex.test(string)) {
    let timestamp = Number(string.length === 10 ? string + '000' : string)
    const toTwoDigits = (num) => {
      const string = String(num)
      return string.length >= 2 ? string : '0' + string
    }
    const obj = new Date(timestamp)
    const year = obj.getFullYear()
    const month = toTwoDigits(obj.getMonth() + 1)
    const date = toTwoDigits(obj.getDate())
    const hours = toTwoDigits(obj.getHours())
    const minutes = toTwoDigits(obj.getMinutes())
    const seconds = toTwoDigits(obj.getSeconds())
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
  } else {
    return null
  }
}

const toTimestamp = (timeString) => {
  timeString = timeString.replace(/-/g, '/')
  const timestamp = Date.parse(new Date(timeString))
  return isNaN(timestamp) ? null : timestamp
}

const toArray = (param, separator) => {
  if (Array.isArray(param)) return params 
  if (typeof param === 'object') {
    let array = []
    for (let key in param) {
      array.push(param[key])
    }
    return array
  } else {
    param = String(param).replace(/\s/g, '')
    return separator ? param.split(separator) : param.split(',')
  }
}

const handleMap = (rules, object, key) => {
  try {
    const rule = rules.find(item => item.action === 'map')
    object[key] = get(object[key], rule.payload, null)
  } finally {
    return object
  }
}

const handleRename = (rules, object, key) => {
  try {
    const rule = rules.find(item => item.action === 'rename')
    object[rule.payload] = object[key]
    delete object[key]
  } finally {
    return object
  }
}

const handleTransform = (rules, object, key) => {
  try {
    const list = rules.filter(item => item.action === 'transform')
    list.forEach(rule => {
      switch (rule.method) {
        case 'nullable':
          object[key] = nullable(object[key])
          break
        case 'toTimeString':
          object[key] = toTimeString(object[key])
          break
        case 'toDateString':
          object[key] = toTimeString(object[key]).substring(0, 10)
          break
        case 'toTimestamp':
          object[key] = toTimestamp(object[key])
          break
        case 'toArray':
          object[key] = toArray(object[key], rule.payload)
      }
    })
  } finally {
    return object
  }
}

const handleConvert = (rules, object, key) => {
  try {
    const rule = rules.find(rule => rule.action === 'convert')
    switch (rule.payload) {
      case 'number':
        if (['true', 'false'].includes(object[key])) {
          object[key] = object[key] === 'true' ? 1 : 0
        } else {
          object[key] = Number(object[key])
        }
        break
      case 'boolean':
        if (['true', 'false'].includes(object[key])) {
          object[key] = object[key] === 'true' ? true : false
        } else if (['0', '1'].includes(object[key])) {
          object[key] =  Boolean(Number(object[key]))
        } else {
          object[key] =  Boolean(object[key])
        }
        break
      case 'string':
        object[key] = object[key] !== null ? String(object[key]) : ''
    }
  } finally {
    return object
  }
}

const traverse = (object, rules) => {
  for (let key in rules) {
    if (object.hasOwnProperty(key)) {
      if (typeof rules[key] === 'object') {
         traverse(object[key], rules[key])
      } else {
        const propRules = parseRules(rules[key])
        object = handleMap(propRules, object, key)
        object = handleTransform(propRules, object, key)
        object = handleConvert(propRules, object, key)
        object = handleRename(propRules, object, key)
      }
    } else {
      if (typeof rules[key] === 'function') {
        object[key] = rules[key](source) || null
      }
    }
  }
  return object
}

module.exports = {
  fit (options) {
    source = clone(options.source)
    let rootObject = clone(options.source)
    const rules = options.rules
    rootObject = filter(rootObject, { accept: options.accept, reject: options.reject })
    return traverse(rootObject, rules)
  }
}
