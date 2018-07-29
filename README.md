# SKR.JS

>前后端交互数据预处理工具

## 前言

Skr.js 是一个前后端交互数据预处理工具。

它或许能够帮助前端开发者解决一些问题，减少简单重复的劳动，例如：

- 数据类型或格式错误
- 数据冗余
- 数据不 match 前端数据模型
- 无法忍受字段命名不合理
- ...

Anyway，最好还是给后端同学加个鸡腿🍗，让他有空优化一下接口设计吧。:)

## 安装

NPM 方式：

```
npm install skr.js --save
```

浏览器方式：

```
<script src="skr.js"></script>
```

## 快速开始

假设存在原始数据对象 `raw` ：

``` js
const raw = {
  name: 'foo',
  age: '18',
  image: {
    id: 1,
    url: 'http://example.com/file.jpg'
  },
  created_at: 1514736000,
  updated_at: 1514737000
  deleted_at: 1514738000
}
```

使用 skr.js 处理数据：

``` js
skr.fit({
  source: raw,
  reject: ['updated_at', 'deleted_at'],
  rules: {
    name: 'rename:nickname',
    age: 'number',
    image: 'rename:avatar|map:url',
    created_at: 'toTimeString'
  }
})
```

`options.rules` 用于定义某个属性的处理规则。规则通常是一个字符串，使用 `|` 分隔命令。

返回值：

``` js
{
  nickname: 'foo',
  age: 18,
  avatar: 'http://example.com/file.jpg',
  created_at: '2018-01-01 00:00:00'
}
```

## 过滤

使用 `accept` 或 `reject` 选项过滤对象中多余的属性。

``` js
skr.fit({
  source: {
    foo: 'bar',
    baz: 'bla bla bla ...'
  },
  accept: ['foo'],  // 要保留的属性列表
  reject: ['baz']   // 要滤去的属性列表
})
```

返回值：

``` js
{ foo: 'bar' }
```

## 数据处理

### 类型转换

将属性转换成 String、 Number 或 Boolean 类型。

``` js
skr.fit({
  source: { age: '18', status: '1' },
  rules: {
    age: 'number',  // 转换成数字
    status: 'boolean'  // 转换成布尔值
  }
})
```
返回值：

``` js
{ age: 18, status: true }
```

特殊处理：
1. String 转 Number 时，字符串 *true*、*false* 分别换转为 `1`、 `0`
2. String 转 Boolean 时，字符串 *true*、*1* 转换为布尔值 `true`，同理 *false*、*0* 转换为布尔值 `false`
3. 目标类型为 String 时，`null` 转换成空字符串。

### 映射

将对象的子属性/孙子属性的值作为它的值。

``` js
skr.fit({
  source: {
    foo: { bar: 'hello' },
    baz: { ham: { egg: 'world' } }
  },
  rules: {
    foo: 'map:bar',
    bar: 'map:ham.egg'
  }
})
```

返回值：

``` js
{ foo: 'hello', bar: 'world' }
```

### 重命名

修改属性的名称。

``` js
skr.fit({
  source: { name: 'foo' },
  rules: {
    name: 'rename:nickname'
  }
})
```

返回值：

``` js
{ nickname: 'foo' }
```

### nullable

当字符串没有内容时，返回 `null` 。

``` js
skr.fit({
  source: { address: '' },
  rules: { address: 'nullable' }
})
```

返回值：

``` js
{ address: null }
```

### toArray

将对象或字符串处理成数组。对于字符串，默认使用逗号分割。使用 `toArray:{分隔符}` 可以指定分隔符，但分隔符不能是 `|` 。

``` js
skr.fit({
  source: {
    foo: {
      1: { ham: 'egg' },
      2: { egg: 'ham' }
    },
    bar: '1, 2, 3'
  },
  rules: {
    foo: 'toArray',
    bar: 'toArray'
  }
})
```

返回值：

``` js
{
  foo: [{ ham: 'egg' }, { egg: 'ham' }],
  bar: [1, 2, 3]
}
```

### toTimeString

将时间戳转换成时间字符串，可以是 10 位的秒级时间戳或 13 位的毫秒级时间戳。

``` js
skr.fit({
  source: { time: '1514736000' },
  rules: { time: 'toTimeString' }
})
```

返回值：

``` js
{ time: '2018-01-01 00:00:00' }
```

### toDateString

时间戳转日期字符串，与 `toTimeString` 的区别是不含时分秒。

### toTimestamp

时间字符串转毫秒级时间戳。

``` js
skr.fit({
  source: { time: '2018-01-01 00:00:00' },
  rules: { time: 'toTimestamp' }
})
```

返回值：

``` js
{ time: 1514736000000 }
```

## 手动处理

使用方法作为规则可以手动处理数据，方法的参数 `data` 是没有经过处理的原始数据。另外，这么做也可以给对象添加属性。

``` js
skr.fit({
  source: { age: 19 },
  rules: {
    age: (data) => { return data - 1 }
  }
})
```

返回值：

``` js
{ age: 18 }
```

## 多层规则

规则可以嵌套对象，用于处理较深层级的数据。

``` js
skr.fit({
  source: {
    foo: {
      bar: 'baz'
    }
  },
  rules: {
    foo: {
      bar: 'boolean'
    }
  }
})
```

返回值：

``` js
{
  foo: { bar: true }
}
```
