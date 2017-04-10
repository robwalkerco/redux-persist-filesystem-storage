# Redux persist node storage

[![npm version](https://img.shields.io/npm/v/redux-persist-filesystem-storage.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist-filesystem-storage)
[![npm downloads](https://img.shields.io/npm/dt/redux-persist-filesystem-storage.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist-filesystem-storage)

Storage adaptor to use [react-native-fetch-blob](https://github.com/wkh237/react-native-fetch-blob) with [redux-persist](https://github.com/rt2zz/redux-persist), by implementing the needed methods: `setItem`, `getItem`, `removeItem` and `getAllKeys`

This storage can be used on Android to prevent issues with the storage limitations in the RN AsyncStorage implementation. (See [redux-persist#199](https://github.com/rt2zz/redux-persist/issues/199), [redux-persist#284](https://github.com/rt2zz/redux-persist/issues/284))

## install
Simply run:

```bash
yarn add redux-persist-filesystem-storage
```
or
```bash
npm install --save redux-persist-filesystem-storage
```

## usage
```javascript
import FilesystemStorage from 'redux-persist-filesystem-storage'
import { persistStore, autoRehydrate } from 'redux-persist'

const store = createStore(reducer, undefined, autoRehydrate())

persistStore(
  store,
  {
    storage: FilesystemStorage,
  },
)
```

## usage with custom options
```javascript
import RNFetchBlob from 'react-native-fetch-blob'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import { persistStore, autoRehydrate } from 'redux-persist'

const store = createStore(reducer, undefined, autoRehydrate())

persistStore(
  store,
  {
    storage: FilesystemStorage.config(
      {
        storagePath: `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`,
      },
    },
  )
)

```
