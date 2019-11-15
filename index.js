/**
 * @flow
 */

import RNFetchBlob from "rn-fetch-blob";

const createStoragePathIfNeeded = path =>
  RNFetchBlob.fs
    .exists(path)
    .then(exists =>
      exists
        ? new Promise(resolve => resolve(true))
        : RNFetchBlob.fs.mkdir(path)
    );

const onStorageReadyFactory = (storagePath: string) => (func: Function) => {
  const storage = createStoragePathIfNeeded(storagePath);

  return (...args: Array<any>) => storage.then(() => func(...args));
};

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`;

let onStorageReady = onStorageReadyFactory(defaultStoragePath);
let options = {
  storagePath: defaultStoragePath,
  encoding: "utf8",
  toFileName: (name: string) => name.split(":").join("-"),
  fromFileName: (name: string) => name.split("-").join(":")
};

const pathForKey = (key: string) =>
  `${options.storagePath}/${options.toFileName(key)}`;

const FilesystemStorage = {
  config: (customOptions: Object) => {
    options = {
      ...options,
      ...customOptions
    };
    onStorageReady = onStorageReadyFactory(options.storagePath);
  },

  setItem: (key: string, value: string, callback?: (error: ?Error) => void) =>
    RNFetchBlob.fs
      .writeFile(pathForKey(key), value, options.encoding)
      .then(() => callback && callback())
      .catch(error => callback && callback(error)),

  getItem: onStorageReady(
    (key: string, callback?: (error: ?Error, result: ?(Array<number> | string)) => void) => {
      const filePath = pathForKey(options.toFileName(key));

      return RNFetchBlob.fs
        .readFile(filePath, options.encoding)
        .then(data => {
          callback && callback(null, data);
          if (!callback) {
            return data;
          }
        })
        .catch(error => {
          callback && callback(error);
          if (!callback) {
            throw error;
          }
        });
    }
  ),

  removeItem: (key: string, callback?: (error: ?Error) => void) =>
    RNFetchBlob.fs
      .unlink(pathForKey(options.toFileName(key)))
      .then(() => callback && callback())
      .catch(error => {
        callback && callback(error);
        if (!callback) {
          throw error;
        }
      }),

  getAllKeys: (callback?: (error: ?Error, keys: ?Array<string>) => any) =>
    RNFetchBlob.fs
      .exists(options.storagePath)
      .then(exists =>
        exists ? true : RNFetchBlob.fs.mkdir(options.storagePath)
      )
      .then(() =>
        RNFetchBlob.fs
          .ls(options.storagePath)
          .then(files => files.map<string>(file => options.fromFileName(file)))
          .then(files => {
            callback && callback(null, files);
            if (!callback) {
              return files;
            }
          })
      )
      .catch(error => {
        callback && callback(error);
        if (!callback) {
          throw error;
        }
      }),

    clear: undefined // Workaround for Flow error coming from `clear` not being part of object literal
};

FilesystemStorage.clear = (callback?: (error: ?Error, allKeysCleared: boolean | void) => void) =>
  FilesystemStorage.getAllKeys((error, keys) => {
    if (error) throw error;

    if (Array.isArray(keys) && keys.length) {
      const removedKeys = [];

      keys.forEach(key => {
        FilesystemStorage.removeItem(key, (error: ?Error) => {
          removedKeys.push(key);
          if (error && callback) {
            callback(error, false);
          }

          if (removedKeys.length === keys.length && callback)
            callback(null, true);
        });
      });
      return true;
    }

    callback && callback(null, false);
    return false;
  }).catch(error => {
    callback && callback(error);
    if (!callback) {
      throw error;
    }
  });

export default FilesystemStorage;
