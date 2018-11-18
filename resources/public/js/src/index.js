import regeneratorRuntime from "regenerator-runtime";
import "regenerator-runtime/runtime";
import $ from "jquery";
import VueChartkick from 'vue-chartkick'
import Vue from 'vue'
import Chart from 'chart.js'
import vSelect from 'vue-select'
import VTooltip from 'v-tooltip'
import AsyncComputed from 'vue-async-computed'

Vue.use(AsyncComputed);
Vue.use(VTooltip);
Vue.component('v-select', vSelect);
Vue.use(VueChartkick);

async function getKeywords() {
    return await $.get(`/keywordsplain/`);
}

async function getLineChartKeywords(val, keys, all) {
    console.log(`/linechart-keywords/${val}/!${keys}/${all}/`);
    return await $.get(`/linechart-keywords/${val}/!${keys}/${all}/`);
}

async function getMaxPosted() {
    return await $.get(`/maxposted/`);
}

async function getKeywordStats(keys) {
    return await $.get(`/keywords/!${keys}`);
}

async function getBusinesses(keywords, search, postedMin, postedMax, take, drop) {
    search = search === "" ? "!" : search;
    return await $.get(`/businesses/!${keywords}/${search}/${postedMin}/${postedMax}/${take}/${drop}`);
}



var app = new Vue({
    el: '#app',
    data: {
        searchKeywords: '',
        selectedKeys: ['Java', 'SQL'],
        loadedKeywords: [],
        lineChartOptions: {
            library: {scales: {yAxes: [{ticks: {maxTicksLimit: 20}}]}},
            onlyKeyedAds: {
                label: "Kun annonser med nøkkelord",
                value: true,
                tooltip: `Velg å kun ta med stillinger som inneholder minst en teknologi. <br> Noen stillingsannonser er veldig generell og inneholder ikke teknologier. <br> Datasettet kan inneholde noen ingeniør-stillinger som ikke er it-relatert.`
            },
            get selectedDataset() {
                return this.dataset[0]
            },
            dataset: [
                {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
                {label: "Antall", value: "freq", axisTitle: "Antall", suffix: ""}
            ]
        }
    },
    components: {},
    computed: {},
    asyncComputed: {
        keywordsPlain() {
            return getKeywords().then(e => e);
        },
        lineChartKeywords() {
            this.loadedKeywords = this.loadedKeywords.filter(e => this.selectedKeys.includes(e.name));
            return this.selectedKeys.length === 0 || this.selectedKeys.length === this.loadedKeywords.length ? this.loadedKeywords :
                getLineChartKeywords(this.lineChartOptions.selectedDataset.value,
                    this.selectedKeys.filter(e => !this.loadedKeywords.some(o => o.name === e)).join("!"),
                    !this.lineChartOptions.onlyKeyedAds.value
                ).then(e => this.loadedKeywords = e.concat(this.loadedKeywords));
        }

    },
    watch: {},
    methods: {
        clearKeywords() {
            this.selectedKeys = [];
            this.searchKeywords = '';
        },
        addKeywords() {
            this.selectedKeys = this.selectedKeys.concat(this.keywordsPlain.filter(k => !this.selectedKeys.includes(k) && (this.searchKeywords === '' || k.toLowerCase().includes(this.searchKeywords.toLowerCase()))))
        },
    }
});