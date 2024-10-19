<template>
  <div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
        <img class="logo" src="/icons/icon.png" alt="" width="40" />
        <span class="fs-4">Shark Eagle Tab</span>
      </a>

      <ul class="nav nav-pills">
        <li class="nav-item" v-for="item in navs" :key="item.id">
          <a :href="item.link" class="nav-link" :class="{ active: item.id === activeId }" aria-current="page"> {{ item.name }}</a>
        </li>
      </ul>
    </header>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: ['activeId'],
  data() {
    return {
      navs: [
        {
          id: 1,
          name: 'Home',
          link: '/options/options.html',
        },
        {
          id: 2,
          name: 'Tab Snapshot',
          link: '/options/tab.html',
        },
        {
          id: 3,
          name: 'Settings',
          link: '/options/settings.html',
        },
      ],
    };
  },
};
</script>

<style scoped>
img.logo {
  margin-right: 10px;
}
</style>
