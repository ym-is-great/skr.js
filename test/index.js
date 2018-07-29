const skr = require('../src/index')

const raw = {
  name: 'cym',
  image: {
    id: 1,
    url: 'http://example.com/file.jpg'
  },
  age: '18',
  tel: 15800000000,
  city: '',
  status: '0',
  collecttion: {
    1: {
      foo: 'foo'
    },
    2: {
      bar: 'bar'
    }
  },
  idList: '1, 2, 3, 4',
  others: {
    verified: 'false'
  },
  created_at: '1514736000',
  deleted_at: '1514736000'
}

const result = skr.fit({
  source: raw,
  reject: ['deleted_at'],
  rules: {
    name: 'rename:nickname',
    image: 'rename:avatar|map:url',
    age: 'number',
    tel: 'string',
    city: 'nullable',
    status: 'boolean',
    collecttion: 'toArray',
    idList: 'toArray',
    others: {
      verified: 'boolean'
    },
    created_at: 'toTimeString',
    phone: (data) => {
      return String(data.tel)
    }
  }
})

console.log('result', result)