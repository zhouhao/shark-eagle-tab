import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { genId, getCurrentTimestampInMs } from './base';

PouchDB.plugin(PouchDBFind);
const db = new PouchDB('shark-eagle-tab');
db.createIndex({
  index: { fields: ['url'] },
});

db.createIndex({
  index: { fields: ['lastViewTime'] },
});

const idPrefix = 'tab';

export const fetchAllMyTabs = () => {
  return new Promise((resolve, reject) => {
    db.allDocs({ include_docs: true, descending: true })
      .then(doc => {
        resolve(
          doc.rows
            .filter(r => r.id.startsWith(idPrefix))
            .map(r => {
              r.doc.id = r.doc._id;
              return r.doc;
            })
        );
      })
      .catch(error => {
        console.error(error);
        reject(error instanceof Error ? error : new Error(error.toString()));
      });
  });
};

export const fetchByUrl = url => {
  return new Promise((resolve, reject) => {
    db.find({
      selector: { url: url },
      limit: 1,
    })
      .then(result => {
        console.log('query result: find one', JSON.stringify(result));
        resolve(
          result.docs.map(d => {
            d.id = d._id;
            return d;
          })
        );
      })
      .catch(error => {
        console.log('query result: not found', error.toString());
        console.error(error);
      });
  });
};

export const createTab = (url, title) => {
  return new Promise((resolve, reject) => {
    const id = idPrefix + '-' + genId();
    const now = getCurrentTimestampInMs();
    const tab = {
      _id: id,
      url,
      title,
      createdAt: now,
      lastViewTime: now,
      count: 1,
    };

    db.put(tab)
      .then(_ => {
        resolve(db.get(id));
      })
      .catch(error => {
        console.error(error);
        reject(error instanceof Error ? error : new Error(error.toString()));
      });
  });
};

// Update tab info by bumping the count and updating the last view time,
// if title is provided, update the title as well.
export const updateTab = (tab, title = '') => {
  return new Promise((resolve, reject) => {
    if (!tab.id) {
      reject(new Error('Tab update: Missing id field.'));
    }

    const id = tab.id;
    db.get(id)
      .then(doc => {
        // https://pouchdb.com/guides/documents.html#updating-documents%E2%80%93correctly
        doc.title = title || doc.title;
        doc.lastViewTime = getCurrentTimestampInMs();
        doc.count = (doc.count || 0) + 1;
        db.put(doc).then(_ => {
          db.get(id).then(doc => resolve(doc));
        });
      })
      .catch(error => {
        console.error(error);
        reject(error instanceof Error ? error : new Error(error.toString()));
      });
  });
};

export const deleteTab = id => {
  return new Promise((resolve, reject) => {
    if (!id || id < 0) {
      reject(new Error('ID to delete is not valid'));
    }

    db.get(id)
      .then(doc => {
        db.remove(doc).then(_ => resolve());
      })
      .catch(error => {
        console.error(error);
        reject(error instanceof Error ? error : new Error(error.toString()));
      });
  });
};
