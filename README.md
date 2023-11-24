# Adonis Inspect
Inspect requests for Adonis v4, a very lighter and minimalist version of Laravel's Telescope.

Contributions are welcomed.

# License

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://badge.fury.io/js/@suhendra%2Fadonis-inspect.svg)](https://www.npmjs.com/package/@suhendra/adonis-inspect)

![image](/assets/preview-list.png)
![image](/assets/preview-show.png)

### Installation
```
npm install @suhendra/adonis-inspect
```

### Configure

Register it in `start/app.js`:

```javascript
const providers = [
  ...
  '@suhendra/adonis-inspect/providers/InspectProvider'
];
```

### Usage

Visit `<app_url>/_inspect` to view the lists of requests, e.g: `http://localhost:3333/_inspect`.

If on dev, prevent reload everytime new json file created by ignoring the used directory, e.g: `adonis serve --dev --ignore=storage`.

#### Cleaning Up

Run ace command `adonis inspect:clean`