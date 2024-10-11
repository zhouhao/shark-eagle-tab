import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { getCurrentTimestampInMs } from './base';
import { getSanitizedUrl } from './urls';

PouchDB.plugin(PouchDBFind);
const db = new PouchDB('shark-eagle-tab');
db.createIndex({
  index: { fields: ['url'] },
});

db.createIndex({
  index: { fields: ['lastViewTime'] },
});

const idPrefix = 'http';

const processError = (error, reject) => {
  console.error(error);
  reject(error instanceof Error ? error : new Error(error.toString()));
};

const createTab = (url, title) => {
  return new Promise((resolve, reject) => {
    const now = getCurrentTimestampInMs();
    const tab = {
      _id: url,
      title,
      createdAt: now,
      lastViewTime: now,
      count: 1,
    };

    db.put(tab)
      .then(_ => {
        resolve(db.get(url));
      })
      .catch(error => {
        processError(error, reject);
      });
  });
};

export const fetchAllMyTabs = () => {
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

// Update tab info by bumping the count and updating the last view time,
// if title is provided, update the title as well.
export const upsertTabByUrl = (url, title) => {
  const id = getSanitizedUrl(url);
  return new Promise((resolve, reject) => {
    db.get(id)
      .then(result => {
        result.count = (result.count || 0) + 1;
        result.title = title || result.title;
        result.lastViewTime = getCurrentTimestampInMs();
        db.put(result).then(_ => {
          db.get(id).then(doc => resolve(doc));
        });
      })
      .catch(error => {
        if (error.status === 404) {
          // create the tab here
          createTab(id, title)
            .then(tab => resolve(tab))
            .catch(error => {
              processError(error, reject);
            });
        } else {
          processError(error, reject);
        }
      });
  });
};

export const deleteTab = url => {
  return new Promise((resolve, reject) => {
    if (!url || url < 0) {
      reject(new Error('ID to delete is not valid'));
    }

    db.get(url)
      .then(doc => {
        db.remove(doc).then(_ => resolve());
      })
      .catch(error => {
        processError(error, reject);
      });
  });
};
