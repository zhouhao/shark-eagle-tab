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

const createTab = (url, title, favIconUrl) => {
  return new Promise((resolve, reject) => {
    const now = getCurrentTimestampInMs();
    const tab = {
      _id: url,
      title,
      favIconUrl,
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
    db.allDocs({ include_docs: true })
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
export const upsertTabByUrl = (url, title, favIconUrl) => {
  const id = getSanitizedUrl(url);
  return new Promise((resolve, reject) => {
    db.get(id)
      .then(result => {
        result.count = (result.count || 0) + 1;
        result.title = title || result.title;
        result.favIconUrl = favIconUrl || result.favIconUrl;
        result.lastViewTime = getCurrentTimestampInMs();
        db.put(result).then(_ => {
          db.get(id).then(doc => resolve(doc));
        });
      })
      .catch(error => {
        if (error.status === 404) {
          // create the tab here
          createTab(id, title, favIconUrl)
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
    if (!url || !url.startsWith('http')) {
      reject(new Error('Url to delete is not valid'));
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

export const cleanOldTabs = ts => {
  return fetchAllMyTabs()
    .then(docs => {
      const docsToDelete = docs
        .filter(d => d.lastViewTime < ts)
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
      } else {
        console.log(result);
      }
    })
    .catch(error => {
      console.error('Error cleaning tabs:', error);
    });
};
