<template>
  <div class="container">
    <div class="py-5 text-center">
      <img class="d-block mx-auto mb-4" src="/icons/icon.png" alt="" />
      <p>请直视我睿智的眼神</p>
      <p>Please gaze into my wise eye</p>
    </div>

    <div class="row">
      <table id="note-table" class="display compact" style="width:100%">
        <thead>
          <tr>
            <th>title</th>
            <th>count</th>
            <th>last view time</th>
            <th>Timestamp</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getUrlHostname } from '../utils/urls';
import { formatDate } from '../utils/base';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as DB from '../utils/db';

export default {
  name: 'App',

  data() {
    return {
      dataTable: null,
    };
  },
  mounted() {
    this.dataTable = $('#note-table').DataTable({
      order: [[2, 'desc']],
      processing: true,
      dom: 'Blfrtip',
      columns: [{ width: '35%' }, { width: '10%' }, { width: '20%' }, { width: '10%' }, { width: '5%' }],
    });
    this.refreshTableData();
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
    refreshTableData() {
      DB.fetchAllMyTabs().then(tabs => {
        this.dataTable.clear();
        tabs.forEach(tab => {
          this.dataTable.row
            .add([
              `<a href="${tab._id}" target="_blank"><img src="https://s2.googleusercontent.com/s2/favicons?domain=${tab._id}" alt="favicon"/> ${tab.title}</a>`,
              tab.count,
              formatDate(tab.lastViewTime),
              formatDate(tab.createdAt),
              `<button type="button" data-id="${tab._id}" class="btn btn-danger note-delete-btn">Delete</button>`,
            ])
            .draw(false);
        });
      });
    },
    deleteNote(url) {
      if (confirm('Are you sure to delete this?' + url)) {
        DB.deleteTab(url)
          .then(res => {
            this.refreshTableData();
          })
          .catch(err => {
            console.error(err);
          });
      }
    },
  },
};
</script>

<style>
.dataTables_wrapper {
  width: 100%;
}

.dataTables_filter,
.dt-buttons,
.dataTables_paginate,
.dataTables_info,
.dataTables_length {
  display: inline-block;
}

.dataTables_filter,
.dataTables_paginate {
  float: right;
}

.dataTables_length {
  margin-left: 10px;
}
</style>
