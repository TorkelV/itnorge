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


Vue.component('ad-stats', {});

var app = new Vue({
    el: '#app',
    data: {
        page: 'front',
        bp: {
            loaded: [],
            keywords: [],
            postedMin: 0,
            postedMax: 0,
            toTake: 25,
            search: "",
            lastSearch: false,
        },
        onBottomOfPage: false,
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
            selectedDataset: {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
            dataset: [
                {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
                {label: "Antall", value: "freq", axisTitle: "Antall", suffix: ""}
            ]
        }
    },
    watch: {
        onBottomOfPage(onBottomOfPage) {
            if (onBottomOfPage) {
                this.updateBusinesses();
            }
        },
        'lineChartOptions.selectedDataset': function (){
            this.loadedKeywords = [];
        }


    },
    asyncComputed: {
        maxPosted: {
            lazy: true,
            get() {
                return this.bp.postedMax ? this.bp.postedMax : getMaxPosted().then(e => this.bp.postedMax = e);
            }
        },
        keywordsPlain: {
            lazy: true,
            get() {
                return getKeywords().then(e => e);
            }
        },
        lineChartKeywords: {
            lazy: true,
            get() {
                this.loadedKeywords = this.loadedKeywords.filter(e => this.selectedKeys.includes(e.name));
                return this.selectedKeys.length === 0 || this.selectedKeys.length === this.loadedKeywords.length ? this.loadedKeywords :
                    getLineChartKeywords(this.lineChartOptions.selectedDataset.value,
                        this.selectedKeys.filter(e => !this.loadedKeywords.some(o => o.name === e)).join("!"),
                        !this.lineChartOptions.onlyKeyedAds.value
                    ).then(e => this.loadedKeywords = e.concat(this.loadedKeywords));
            }
        }

    },
    methods: {
        bottomScrollHandler() {
            this.onBottomOfPage = this.bottomVisible();
        },
        initBusinesses() {
            this.page = "businesses";
            this.updateBusinesses();
            window.addEventListener('scroll', this.bottomScrollHandler);
        },
        initFront() {
            this.page = "front";
            window.removeEventListener('scroll', this.bottomScrollHandler);
        },
        clearKeywords() {
            this.selectedKeys = [];
            this.searchKeywords = '';
        },
        addKeywords() {
            this.selectedKeys = this.selectedKeys.concat(this.keywordsPlain.filter(k => !this.selectedKeys.includes(k) && (this.searchKeywords === '' || k.toLowerCase().includes(this.searchKeywords.toLowerCase()))))
        },
        updateBusinesses(clear) {
            let keysToCheck = ['postedMax', 'postedMin', 'search'];
            if (!(clear && this.bp.lastSearch
                && this.bp.keywords.join(",") === this.bp.lastSearch.keywords.join(",")
                && keysToCheck.every(e => this.bp.lastSearch[e] === this.bp[e]))) {
                this.bp.lastSearch = {
                    search: this.bp.search,
                    postedMin: this.bp.postedMin,
                    postedMax: this.bp.postedMax,
                    keywords: this.bp.keywords.slice()
                };
                if(clear){
                    this.bp.loaded = [];
                }
                getBusinesses(this.bp.keywords.join("!"),
                    this.bp.search,
                    this.bp.postedMin,
                    this.bp.postedMax,
                    this.bp.loaded.length + this.bp.toTake,
                    this.bp.loaded.length
                ).then(e => this.bp.loaded = clear ? e : [].concat(this.bp.loaded).concat(e))
            }
        },
        bottomVisible() {
            const scrollY = window.scrollY;
            const visible = document.documentElement.clientHeight;
            const pageHeight = document.documentElement.scrollHeight;
            const bottomOfPage = visible + scrollY >= pageHeight;
            return bottomOfPage || pageHeight < visible;
        }
    },
    created() {
    }
});