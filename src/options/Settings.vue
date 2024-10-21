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
          <div class="card" id="more-coming-soon">
            <h5 class="card-header">
              More coming soon...
            </h5>
            <div class="card-body">
              More settings will be added soon...
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
import { getSettings, saveSettings } from '../utils/base';

export default {
  name: 'Settings',
  components: { Header },

  data() {
    return {
      selectedSettingId: 1,
      cleanupSetting: 0,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      getSettings(settings => {
        this.cleanupSetting = (settings && settings.cleanupSetting) || 0;
      });
    },
    updateCleanupConfig() {
      getSettings(result => {
        const settings = result || {};
        settings.cleanupSetting = this.cleanupSetting;
        saveSettings(settings);
      });
    },
    getSettingItems() {
      return [
        {
          id: 1,
          name: 'Auto Clean Up',
          href: '#clean-up',
        },
        {
          id: 100,
          name: 'More coming soon',
          href: '#more-coming-soon',
        },
      ];
    },

    updateSettingId(group) {
      this.selectedSettingId = group;
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
