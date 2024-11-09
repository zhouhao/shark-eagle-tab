import PouchDB from 'pouchdb-browser';
import { getCurrentTimestampInMs, toastError, toastSuccess, toastWarn } from './base';
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
        createdAt: t.createdAt || now,
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

export const cleanTabs = lambda => {
  return fetchAllSnapshots()
    .then(docs => {
      const docsToDelete = docs
        .filter(d => lambda(d))
        .map(d => ({
          _id: d._id,
          _rev: d._rev,
          _deleted: true,
        }));

      // Perform the bulk delete operation
      if (docsToDelete.length > 0) {
        return db.bulkDocs(docsToDelete);
      } else {
        return Promise.resolve('No tabs to clean');
      }
    })
    .then(result => {
      if (Array.isArray(result)) {
        console.log(`Cleaned ${result.length} tabs`);
        toastSuccess(`Cleaned ${result.length} tabs`);
      } else {
        toastWarn(result);
      }
    })
    .catch(error => {
      console.error('Error cleaning tabs:', error);
      toastError('Error cleaning tabs:' + error.toString());
    });
};
