# Redux persist filesystem storage

[![npm version](https://img.shields.io/npm/v/redux-persist-filesystem-storage.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist-filesystem-storage)
[![npm downloads](https://img.shields.io/npm/dt/redux-persist-filesystem-storage.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist-filesystem-storage)

Storage adaptor to use [react-native-blob-util](https://github.com/RonRadtke/react-native-blob-util) with [redux-persist](https://github.com/rt2zz/redux-persist), by implementing the needed methods: `setItem`, `getItem`, `removeItem`, `getAllKeys` and `clear`.

This storage can be used on Android to prevent issues with the storage limitations in the RN AsyncStorage implementation. (See [redux-persist#199](https://github.com/rt2zz/redux-persist/issues/199), [redux-persist#284](https://github.com/rt2zz/redux-persist/issues/284))

## install

**Please note:** v2 of this library supports React Native 0.60 and above only. If you are using React Native 0.59 and below, please use v1.x.

```bash
yarn add redux-persist-filesystem-storage
```

or, for React Native 0.59 and below:

```bash
yarn add redux-persist-filesystem-storage@1
```

Then, as [react-native-blob-util](https://github.com/RonRadtke/react-native-blob-util) is a dependency of this project, it will also need setting up as its [their installation docs](https://github.com/RonRadtke/react-native-blob-util#installation).


## usage

Simply use 'FilesystemStorage' as the storage option in the redux-persist config.

```javascript
import FilesystemStorage from 'redux-persist-filesystem-storage'
...

const persistConfig = {
  key: 'root',
  storage: FilesystemStorage,
}

...
```

## usage with custom options

```javascript
import FilesystemStorage from 'redux-persist-filesystem-storage'
...

// These are all the config options, with their default values
FilesystemStorage.config({
     storagePath: `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`,
     encoding: "utf8",
     toFileName: (name: string) => name.split(":").join("-"),
     fromFileName: (name: string) => name.split("-").join(":"),
});

const persistConfig = {
  key: 'root',
  storage: FilesystemStorage,
  toFileName: (name: string) => name.split(":").join("-"),
  fromFileName: (name: string) => name.split("-").join(":")
}

...
```

## migration from previous storage

**Using redux-persist V5?**

[Redux-Persist v5 migrate from one storage system to another](https://github.com/rt2zz/redux-persist/issues/806#issuecomment-425838924)

**Using redux-persist V4?**

the snippet below lets you migrate redux data previously stored in
`AsyncStorage` to `redux-persist-filesystem-storage`.

**NOTE** This snippet lets you migrate _healthy_ data. It _will not restore_
data if it is already hit limits of `AsyncStorage`

```javascript
import { persistStore, getStoredState } from 'redux-persist'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import { AsyncStorage } from 'react-native'
import _ from 'lodash'
import { createStore } from 'redux'

const store = createStore(...)

// create persistor for `redux-persist-filesystem-storage`
const fsPersistor = persistStore(
  store,
  { storage: FilesystemStorage },
  async (fsError, fsResult) => {
    if (_.isEmpty(fsResult)) {
      // if state from fs storage is empty try to read state from previous storage
      try {
        const asyncState = await getStoredState({ storage: AsyncStorage })
        if (!_.isEmpty(asyncState)) {
          // if data exists in `AsyncStorage` - rehydrate fs persistor with it
          fsPersistor.rehydrate(asyncState, { serial: false })
        }
      } catch (getStateError) {
        console.warn("getStoredState error", getStateError)
      }
    }
  }
)
```
