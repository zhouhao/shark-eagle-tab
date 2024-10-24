<template>
  <div class="container">
    <main>
      <Header :active-id="2" />
      <div class="row g-5">
        <div class="col-md-5 col-lg-4 order-md-last">
          <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Snapshot</span>
          </h4>
          <div class="list-group border-bottom scrollarea">
            <a
              v-for="group in getSortedGroups()"
              :key="group"
              href="#"
              class="list-group-item list-group-item-action py-3 lh-sm"
              :class="{ active: group === snapshotKey }"
              aria-current="true"
              @click="updateGroup(group)"
            >
              <div class="d-flex w-100 align-items-center justify-content-between">
                <strong class="mb-1">{{ new Date(group).toLocaleString() }}</strong>
                <small>{{ snapshotMap.get(group).length }}</small>
              </div>
            </a>
          </div>
        </div>
        <div class="col-md-7 col-lg-8">
          <div class="card">
            <div class="card-header">
              Created At <b>{{ new Date(snapshotKey).toLocaleString() }}</b>
            </div>
            <div class="card-body">
              <ol class="list-group list-group-numbered">
                <li class="list-group-item tab-entry" v-for="tab in currentList" :key="tab._id">
                  <img :src="getImgSrc(tab)" alt="favicon" width="16" />
                  <a :href="tab.url" target="_blank" :title="tab.title"> {{ truncateString(tab.title) }}</a>
                  <button type="button" class="btn-close float-end delete-btn" aria-label="Close" @click.prevent.stop="deleteById(tab._id)"></button>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import * as DB from '../utils/datetime-db';
import { formatDatetime } from '../utils/base';
import Header from './components/Header.vue';

export default {
  name: 'Tab',
  components: { Header },

  data() {
    return {
      // store a cache copy of all tabs grouped by host name
      snapshotMap: new Map(),
      snapshotKey: 0,
      currentList: [],
    };
  },
  mounted() {
    this.loadSnapshots();
  },
  methods: {
    loadSnapshots() {
      const localSnapshotMap = new Map();

      const self = this;
      DB.fetchAllSnapshots().then(tabs => {
        tabs.forEach(tab => {
          const group = tab.createdAt;
          self.snapshotKey = Math.max(group, self.snapshotKey);
          if (!localSnapshotMap.has(group)) {
            localSnapshotMap.set(group, []);
          }
          localSnapshotMap.get(group).push(tab);
        });
        self.snapshotMap = localSnapshotMap;
        self.currentList = localSnapshotMap.get(self.snapshotKey);
      });
    },
    getSortedGroups() {
      const groups = this.snapshotMap.keys();
      return Array.from(groups).sort((a, b) => b - a);
    },
    getImgSrc(tab) {
      if (!tab.favIconUrl) {
        return '/icons/icon.png';
      }
      return tab.favIconUrl;
    },
    deleteById(id) {
      if (confirm('Are you sure to delete this?')) {
        DB.deleteById(id)
          .then(res => {
            this.loadSnapshots();
          })
          .catch(err => {
            console.error(err);
          });
      }
    },

    updateGroup(group) {
      this.snapshotKey = group;
      this.currentList = this.snapshotMap.get(group);
      this.currentList.sort(this.sortMethod);
    },
    formatTime(ts) {
      return formatDatetime(ts);
    },
    truncateString(str, maxLength = 80) {
      if (str.length <= maxLength) {
        return str;
      }
      return str.slice(0, maxLength) + '...';
    },
  },
};
</script>

<style>
.container {
  max-width: 1440px;
}

.delete-btn {
  color: red;
  display: none;
}

.tab-entry:hover {
  background-color: rgba(169, 169, 169, 0.15);
}

.tab-entry:hover .delete-btn {
  display: block;
}
</style>
