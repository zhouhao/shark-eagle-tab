<template>
  <div class="container">
    <main>
      <Header :active-id="1" />
      <div class="row g-5">
        <div class="col-md-5 col-lg-4">
          <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Tab Group</span>
            <span class="badge bg-primary rounded-pill">{{ tabGroupUrlMap.size }}</span>
          </h4>
          <div class="list-group border-bottom scrollarea">
            <a
              v-for="group in getSortedGroups()"
              :key="group"
              href="#"
              class="list-group-item list-group-item-action py-3 lh-sm"
              :class="{ active: group === currentGroup }"
              aria-current="true"
              @click="updateGroup(group)"
            >
              <div class="d-flex w-100 align-items-center justify-content-between">
                <strong class="mb-1">{{ group }}</strong>
                <small><img :src="getImgSrc(group)" alt="favicon" width="20px"/></small>
              </div>
              <div class="col-10 mb-1 small">
                Url Count: {{ tabGroupUrlMap.get(group).length }} / Total View Count:
                {{ tabGroupViewCountMap.get(group) }}
              </div>
            </a>
          </div>
        </div>
        <div class="col-md-7 col-lg-8">
          <div class="card">
            <div class="card-header">
              Links for Group: <b>{{ currentGroup }}</b>
              <div class="btn-group float-end">
                <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ sortMap.get(sortMethod) }}
                </button>
                <ul class="dropdown-menu float-end">
                  <li v-for="[key, value] in Array.from(sortMap)" :key="key">
                    <a class="dropdown-item" :class="{ active: sortMethod === key, disabled: sortMethod === key }" href="#" @click="updateSortMethod(key)">{{ value }}</a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="card-body">
              <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">🔎</span>
                <input type="text" class="form-control" placeholder="Search By Title Keyword" @keyup.enter="processSearch" ref="searchInput" />
              </div>
              <ol class="list-group list-group-numbered">
                <li class="list-group-item tab-entry" v-for="tab in currentTabList" :key="tab._id">
                  <a :href="tab._id" target="_blank" :title="tab.title"> {{ truncateString(tab.title) }}</a> -
                  <small
                    ><span class="badge text-bg-secondary" title="View Count">{{ tab.count }}</span>
                    <span class="badge text-bg-light" title="Last Viewed Time">{{ formatTime(tab.lastViewTime) }}</span>
                  </small>
                  <button type="button" class="btn-close float-end delete-btn" aria-label="Close" @click="deleteNote(tab._id)"></button>
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
import { getUrlHostname } from '../utils/urls';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import * as DB from '../utils/count-db';
import { containsIgnoreCase, getCurrentTimestampInMs, is1HourAgo, MS_OF_DAY, readableTimestamp } from '../utils/base';
import Header from './components/Header';
import * as Store from '../utils/setting';
import { cleanOldTabs } from '../utils/count-db';

const DEFAULT_GROUP_KEY = 'all';
const SORT_BY_COUNT = (tab1, tab2) => tab2.count - tab1.count;
const SORT_BY_LAST_VIEW = (tab1, tab2) => tab2.lastViewTime - tab1.lastViewTime;
const SORT_MAP = new Map([
  [SORT_BY_COUNT, 'Sort By View Count'],
  [SORT_BY_LAST_VIEW, 'Sort By Most Recent View'],
]);

export default {
  name: 'App',
  components: { Header },
  data() {
    return {
      // store a cache copy of all tabs grouped by host name
      tabGroupUrlMap: new Map(),
      tabGroupViewCountMap: new Map(),
      sortMethod: SORT_BY_COUNT,
      currentGroup: DEFAULT_GROUP_KEY,
      sortMap: SORT_MAP,
      currentTabList: [],
    };
  },
  mounted() {
    this.loadTabData();
  },
  methods: {
    loadTabData() {
      const localTabGroupUrlMap = new Map();
      const localTabGroupViewCountMap = new Map();
      localTabGroupUrlMap.set(DEFAULT_GROUP_KEY, []);
      localTabGroupViewCountMap.set(DEFAULT_GROUP_KEY, 0);

      const cleanupDays = parseInt(Store.get(Store.CLEANUP_DAYS_KEY) || '0');
      if (is1HourAgo(Store.get(Store.LAST_CLEANUP_TIME_KEY)) && cleanupDays && cleanupDays > 0) {
        const ts = getCurrentTimestampInMs() - cleanupDays * MS_OF_DAY;
        cleanOldTabs(ts).then(() => {
          // TODO: may fire some notification to user
          Store.set(Store.LAST_CLEANUP_TIME_KEY, getCurrentTimestampInMs());
        });
      }

      const self = this;
      DB.fetchAllMyTabs().then(tabs => {
        tabs.forEach(tab => {
          const count = tab.count;
          const url = tab._id;
          const host = getUrlHostname(url);
          if (!localTabGroupUrlMap.has(host)) {
            localTabGroupUrlMap.set(host, []);
            localTabGroupViewCountMap.set(host, 0);
          }

          localTabGroupUrlMap.get(host).push(tab);
          localTabGroupViewCountMap.set(host, localTabGroupViewCountMap.get(host) + count);

          localTabGroupUrlMap.get(DEFAULT_GROUP_KEY).push(tab);
          localTabGroupViewCountMap.set(DEFAULT_GROUP_KEY, localTabGroupViewCountMap.get(DEFAULT_GROUP_KEY) + count);
        });
        self.tabGroupUrlMap = localTabGroupUrlMap;
        self.tabGroupViewCountMap = localTabGroupViewCountMap;
        self.currentTabList = localTabGroupUrlMap.get(self.currentGroup);
        self.currentTabList.sort(self.sortMethod);
      });
    },
    getSortedGroups() {
      const groups = this.tabGroupViewCountMap.keys();
      return Array.from(groups).sort((a, b) => this.tabGroupViewCountMap.get(b) - this.tabGroupViewCountMap.get(a));
    },
    getImgSrc(host) {
      if (host === DEFAULT_GROUP_KEY) {
        return '/icons/icon.png';
      }

      const item = this.tabGroupUrlMap.get(host).find(it => it.favIconUrl);
      if (item && item.favIconUrl) {
        return item.favIconUrl;
      }
      return 'https://s2.googleusercontent.com/s2/favicons?domain=' + host;
    },
    deleteNote(url) {
      if (confirm('Are you sure to delete this?')) {
        DB.deleteTab(url)
          .then(res => {
            this.loadTabData();
          })
          .catch(err => {
            console.error(err);
          });
      }
    },
    updateSortMethod(method) {
      this.sortMethod = method;
      this.currentTabList.sort(this.sortMethod);
    },
    updateGroup(group) {
      this.currentGroup = group;
      this.currentTabList = this.tabGroupUrlMap.get(group);
      this.currentTabList.sort(this.sortMethod);
      this.$refs.searchInput.value = '';
    },
    formatTime(ts) {
      return readableTimestamp(ts);
    },
    truncateString(str, maxLength = 80) {
      if (str.length <= maxLength) {
        return str;
      }
      return str.slice(0, maxLength) + '...';
    },
    processSearch(event) {
      const keyword = event.target.value;
      if (!keyword || !keyword.length) {
        this.updateGroup(this.currentGroup);
        return;
      }
      const tabs = this.currentTabList;
      this.currentTabList = tabs.filter(t => {
        return containsIgnoreCase(t.title, keyword);
      });
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
