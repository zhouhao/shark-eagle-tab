<template>
  <div class="container">
    <main>
      <Header :active-id="3" />
      <div class="row g-5">
        <div class="col-md-5 col-lg-4 order-md-last">
          <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Settings</span>
          </h4>
          <div class="list-group border-bottom scrollarea">
            <a
              v-for="group in getSettingItems()"
              :key="group"
              :href="group.href"
              class="list-group-item list-group-item-action py-3 lh-sm"
              :class="{ active: group.id === selectedSettingId }"
              aria-current="true"
              @click="updateSettingId(group.id)"
            >
              <div class="d-flex w-100 align-items-center justify-content-between">
                <strong class="mb-1">{{ group.name }}</strong>
              </div>
            </a>
          </div>
        </div>
        <div class="col-md-7 col-lg-8">
          <div class="card" id="clean-up">
            <h5 class="card-header">
              1. Auto Clean Up
            </h5>
            <div class="card-body">
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="cleanupSetting" value="7" id="days7" />
                <label class="form-check-label" for="days7">
                  Clean up links not viewed in the past 7 days
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="cleanupSetting" value="30" id="days30" />
                <label class="form-check-label" for="days30">
                  Clean up links not viewed in the past 30 days
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="cleanupSetting" value="0" id="no-clean" />
                <label class="form-check-label" for="no-clean">
                  No Clean Up
                </label>
              </div>
              <button type="button" class="btn btn-primary float-end" @click="updateCleanupConfig()">Save</button>
            </div>
          </div>
          <div class="card" id="max-snapshot-count">
            <h5 class="card-header">
              2. Max Snapshot Count
            </h5>
            <div class="card-body">
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="maxSnapshotCount" value="25" id="count-25" />
                <label class="form-check-label" for="count-25">
                  25
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="maxSnapshotCount" value="50" id="count-50" />
                <label class="form-check-label" for="count-50">
                  50
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="maxSnapshotCount" value="100" id="count-100" />
                <label class="form-check-label" for="count-100">
                  100
                </label>
              </div>
              <button type="button" class="btn btn-primary float-end" @click="updateMaxSnapshotCount()">Save</button>
            </div>
          </div>
          <div class="card" id="import-and-export">
            <h5 class="card-header">
              Import & Export
            </h5>
            <div class="card-body">
              <div class="mb-3">
                <input class="form-control" type="file" ref="jsonFile" @change="handleFileChange" accept=".json" />
              </div>
              <button class="btn btn-primary" @click="parseJson" :disabled="!fileSelected">Import</button>

              <button class="btn btn-success float-end" @click="exportJson">Export</button>

              <div class="mt-4">
                <h5>Result:</h5>
                <pre ref="result" class="bg-light p-3 rounded" :class="resultClass" style="max-height: 400px; overflow-y: auto;">
 {{ resultText }}
                </pre>
              </div>
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
import Header from './components/Header.vue';
import * as Store from '../utils/setting';
import 'toastify-js/src/toastify.css';
import { downloadJSON, getCurrentTimestampInMs, toastSuccess } from '../utils/base';
import { fetchAllSnapshots } from '../utils/datetime-db';
import { fetchAllMyTabs } from '../utils/count-db';

export default {
  name: 'Settings',
  components: { Header },

  data() {
    return {
      selectedSettingId: 1,
      cleanupSetting: 0,
      maxSnapshotCount: 100,
      fileSelected: false,
      resultText: 'No file parsed yet',
      resultClass: '',
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.cleanupSetting = Store.getOrDefault(Store.CLEANUP_DAYS_KEY, 7);
      this.maxSnapshotCount = Store.getOrDefault(Store.MAX_SNAPSHOT_COUNT_KEY, 100);
    },
    updateCleanupConfig() {
      Store.set(Store.CLEANUP_DAYS_KEY, parseInt(this.cleanupSetting));
      toastSuccess('Saved Successfully');
    },
    getSettingItems() {
      return [
        {
          id: 1,
          name: 'Auto Clean Up',
          href: '#clean-up',
        },
        {
          id: 2,
          name: 'Max Snapshot Count',
          href: '#max-snapshot-count',
        },
        {
          id: 3,
          name: 'Import & Export',
          href: '#import-and-export',
        },
      ];
    },

    updateSettingId(group) {
      this.selectedSettingId = group;
    },
    updateMaxSnapshotCount() {
      Store.set(Store.MAX_SNAPSHOT_COUNT_KEY, parseInt(this.maxSnapshotCount));
      toastSuccess('Saved Successfully');
    },
    handleFileChange(event) {
      this.fileSelected = event.target.files.length > 0;
    },
    parseJson() {
      const file = this.$refs.jsonFile.files[0];
      if (!file) {
        this.showError('Please select a file first.');
        return;
      }

      const reader = new FileReader();

      reader.onload = e => {
        try {
          // Parse JSON content
          const jsonContent = JSON.parse(e.target.result);

          // Display formatted JSON
          this.resultText = JSON.stringify(jsonContent, null, 2);

          // Add success styling
          this.resultClass = 'text-success';
        } catch (error) {
          this.showError('Invalid JSON file: ' + error.message);
        }
      };

      reader.onerror = () => {
        this.showError('Error reading file');
      };

      // Read the file as text
      reader.readAsText(file);
    },
    showError(message) {
      this.resultText = message;
      this.resultClass = 'text-danger';
    },
    async exportJson() {
      const result = {};
      result.snapshots = await fetchAllSnapshots();
      result.tabs = await fetchAllMyTabs();
      result.settings = {
        cleanupSetting: Store.getOrDefault(Store.CLEANUP_DAYS_KEY, 7),
        maxSnapshotCount: Store.getOrDefault(Store.MAX_SNAPSHOT_COUNT_KEY, 100),
      };
      console.log(JSON.stringify(result));
      downloadJSON(result, 'shark-eagle-tab-' + getCurrentTimestampInMs() + '.json');
      toastSuccess('You data has been exported successfully');
    },
  },
};
</script>

<style>
.container {
  max-width: 1440px;
}

div.card {
  margin-bottom: 15px;
}
</style>
