import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { genId, getCurrentTimestampInMs } from './base';

PouchDB.plugin(PouchDBFind);
const db = new PouchDB('shark-eagle-tab');
db.createIndex({
  index: { fields: ['host'] },
});

db.createIndex({
  index: { fields: ['title'] },
});

const idPrefix = 'tab';

export const fetchAllMyUrls = keyword => {
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

export const fetchAllMyUrlsByHost = host => {
  return new Promise((resolve, reject) => {
    db.find({
      selector: { url: host },
    })
      .then(result => {
        resolve(
          result.docs.map(d => {
            d.id = d._id;
            return d;
          })
        );
      })
      .catch(function(err) {
        console.error(err);
      });
  });
};

export const saveTab = tab => {
  return new Promise((resolve, reject) => {
    const id = idPrefix + '-' + genId();
    tab._id = id;
    tab.createdAt = getCurrentTimestampInMs();

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

export const updateTab = tab => {
  return new Promise((resolve, reject) => {
    if (!tab.id) {
      reject(new Error('Page annotation update: Missing id field.'));
    }

    const id = tab.id;
    db.get(id)
      .then(doc => {
        // https://pouchdb.com/guides/documents.html#updating-documents%E2%80%93correctly
        doc.note = tab.note;
        doc.highlightColor = tab.highlightColor;
        doc.tags = tab.tags;
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

export const deleteTab = tabId => {
  return new Promise((resolve, reject) => {
    if (!tabId || tabId < 0) {
      reject(new Error('Page annotation id to delete is not valid'));
    }

    db.get(tabId)
      .then(doc => {
        db.remove(doc).then(_ => resolve());
      })
      .catch(error => {
        console.error(error);
        reject(error instanceof Error ? error : new Error(error.toString()));
      });
  });
};
