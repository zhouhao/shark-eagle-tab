<template>
  <div class="container">
    <main>
      <div class="py-5 text-center">
        <img class="d-block mx-auto mb-4" src="/icons/icon.png" alt="" width="72" />
        <h2>请直视我睿智的眼神</h2>
        <p class="lead">Please gaze into my wise eye</p>
      </div>

      <div class="row g-5">
        <div class="col-md-5 col-lg-4">
          <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Tab Group</span>
            <span class="badge bg-primary rounded-pill">{{ tabGroupUrlMap.size }}</span>
          </h4>
          <div class="list-group list-group-flush border-bottom scrollarea">
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
                <small><img :src="getImgSrc(group)" alt="favicon"/></small>
              </div>
              <div class="col-10 mb-1 small">Url Count: {{ tabGroupUrlMap.get(group).length }} / Total View Count: {{ tabGroupViewCountMap.get(group) }}</div>
            </a>
          </div>
        </div>
        <div class="col-md-7 col-lg-8">
          <div class="card">
            <div class="card-header">
              Links for Group: {{ currentGroup }}
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
              <ol class="list-group list-group-numbered">
                <li class="list-group-item" v-for="tab in currentTabList" :key="tab._id">
                  <a :href="tab._id" target="_blank"> {{ tab.title }}</a> - <small>(Views: {{ tab.count }}, Last Viewed: {{ formatTime(tab.lastViewTime) }})</small>
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
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import * as DB from '../utils/db';
import { formatDatetime } from '../utils/base';

const DEFAULT_GROUP_KEY = 'all';
const SORT_BY_COUNT = (tab1, tab2) => tab2.count - tab1.count;
const SORT_BY_LAST_VIEW = (tab1, tab2) => tab2.lastViewTime - tab1.lastViewTime;
const SORT_MAP = new Map([
  [SORT_BY_COUNT, 'Sort By View Count'],
  [SORT_BY_LAST_VIEW, 'Sort By Most Recent View'],
]);

export default {
  name: 'App',

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
    const self = this;
    $(document).on('click', '.note-delete-btn', function(event) {
      event.preventDefault();
      const id = $(this).data('id');
      if (id) {
        self.deleteNote(id);
      }
    });
  },
  methods: {
    loadTabData() {
      const localTabGroupUrlMap = new Map();
      const localTabGroupViewCountMap = new Map();
      localTabGroupUrlMap.set(DEFAULT_GROUP_KEY, []);
      localTabGroupViewCountMap.set(DEFAULT_GROUP_KEY, 0);

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
      return 'https://s2.googleusercontent.com/s2/favicons?domain=' + host;
    },
    deleteNote(url) {
      if (confirm('Are you sure to delete this?' + url)) {
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
    },

    formatTime(ts) {
      return formatDatetime(ts);
    },
  },
};
</script>

<style>
.container {
  max-width: 1440px;
}

.bd-placeholder-img {
  font-size: 1.125rem;
  text-anchor: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

@media (min-width: 768px) {
  .bd-placeholder-img-lg {
    font-size: 3.5rem;
  }
}

.b-example-divider {
  width: 100%;
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow: inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1), inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.b-example-vr {
  flex-shrink: 0;
  width: 1.5rem;
  height: 100vh;
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.nav-scroller {
  position: relative;
  z-index: 2;
  height: 2.75rem;
  overflow-y: hidden;
}

.nav-scroller .nav {
  display: flex;
  flex-wrap: nowrap;
  padding-bottom: 1rem;
  margin-top: -1px;
  overflow-x: auto;
  text-align: center;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.btn-bd-primary {
  --bd-violet-bg: #712cf9;
  --bd-violet-rgb: 112.520718, 44.062154, 249.437846;

  --bs-btn-font-weight: 600;
  --bs-btn-color: var(--bs-white);
  --bs-btn-bg: var(--bd-violet-bg);
  --bs-btn-border-color: var(--bd-violet-bg);
  --bs-btn-hover-color: var(--bs-white);
  --bs-btn-hover-bg: #6528e0;
  --bs-btn-hover-border-color: #6528e0;
  --bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);
  --bs-btn-active-color: var(--bs-btn-hover-color);
  --bs-btn-active-bg: #5a23c8;
  --bs-btn-active-border-color: #5a23c8;
}

.bd-mode-toggle {
  z-index: 1500;
}

.bd-mode-toggle .dropdown-menu .active .bi {
  display: block !important;
}
</style>
