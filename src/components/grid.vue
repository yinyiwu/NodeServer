<template lang="html">
    <div>
        <form id="search">
            Search
            <input name="query" v-model="searchQuery">
        </form>
        <table-v :data="gridData" :columns="gridColumns" :filter-key="searchQuery" />
    </div>
</template>
<script>
import TableV from './table.vue'
export default {
    created: function() {
        this.fetchRemoteData();
    },
    data: () => {

        return {
            searchQuery: '',
            gridColumns: ['Date', 'Download'],
            gridData: []
        };
    },
    components: {
        TableV
    },
    methods: {
        fetchRemoteData: function() {
            this.gridData = [{
                Date: '沒資料',
                Download: ''
            }];
            let scope = this;
            this.$resource('/Customer/Daily/Key')
                .get()
                .then(result => {
                    this.gridData = result.body;
                });

        }

    }
}
</script>
