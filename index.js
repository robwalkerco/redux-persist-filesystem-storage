/**
* @flow
*/

import RNFetchBlob from 'react-native-fetch-blob'

let options = {
  storagePath: `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`,
  encoding: 'utf8',
  toFileName: (name: string) => name.split(':').join('-'),
  fromFileName: (name: string) => name.split('-').join(':'),
}

const pathForKey = (key: string) => `${options.storagePath}/${options.toFileName(key)}`

const FilesystemStorage = {
  config: (
    customOptions: Object,
  ) => {
    options = {
      ...options,
      ...customOptions,
    }
  },

  setItem: (
    key: string,
    value: string,
    callback: (error: ?Error) => void,
  ) =>
    RNFetchBlob.fs.writeFile(pathForKey(key), value, options.encoding)
      .then(() => callback())
      .catch(error => callback(error && error)),

  getItem: (
    key: string,
    callback: (error: ?Error, result: ?string) => void
  ) =>
    RNFetchBlob.fs.readFile(pathForKey(options.toFileName(key)), options.encoding)
      .then(data => callback(null, data))
      .catch(error => callback(error)),

  removeItem: (
    key: string,
    callback: (error: ?Error) => void,
  ) =>
    RNFetchBlob.fs.unlink(pathForKey(options.toFileName(key)))
      .then(() => callback())
      .catch(error => callback(error)),

  getAllKeys: (
    callback: (error: ?Error, keys: ?Array<string>) => void,
  ) =>
    RNFetchBlob.fs.exists(options.storagePath)
    .then(exists =>
      exists ? true : RNFetchBlob.fs.mkdir(options.storagePath)
    )
    .then(() =>
      RNFetchBlob.fs.ls(options.storagePath)
        .then(files => files.map(file => options.fromFileName(file)))
        .then(files => callback(null, files))
    )
    .catch(error => callback(error)),
}

export default FilesystemStorage
