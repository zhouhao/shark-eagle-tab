import PouchDB from 'pouchdb-browser';
import { getCurrentTimestampInMs } from './base';
import { nanoid } from 'nanoid';

const db = new PouchDB('shark-eagle-tab-snapshot');

const idPrefix = 'tabid';

const processError = (error, reject) => {
  console.error(error);
  reject(error instanceof Error ? error : new Error(error.toString()));
};

export const saveSnapshot = tabs => {
  return new Promise((resolve, reject) => {
    if (!tabs || !tabs.length) {
      resolve();
      return;
    }
    const now = getCurrentTimestampInMs();
    tabs.forEach(t => {
      const tab = {
        _id: idPrefix + nanoid(),
        url: t.url,
        favIconUrl: t.favIconUrl,
        title: t.title,
        createdAt: now,
      };
      db.put(tab).then(_ => {
        resolve();
      });
    });
  });
};

export const fetchAllSnapshots = () => {
  return new Promise((resolve, reject) => {
    db.allDocs({ include_docs: true, descending: true })
      .then(doc => {
        resolve(
          doc.rows
            .filter(r => r.id.startsWith(idPrefix))
            .map(r => {
              return r.doc;
            })
        );
      })
      .catch(error => {
        processError(error, reject);
      });
  });
};

export const deleteById = id => {
  return new Promise((resolve, reject) => {
    if (!id || !id.startsWith(idPrefix)) {
      reject(new Error('ID to delete is not valid'));
    }

    db.get(id)
      .then(doc => {
        db.remove(doc).then(_ => resolve());
      })
      .catch(error => {
        processError(error, reject);
      });
  });
};
