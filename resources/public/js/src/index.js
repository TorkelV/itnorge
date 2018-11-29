import regeneratorRuntime from "regenerator-runtime";
import vueSlider from 'vue-slider-component'
import "regenerator-runtime/runtime";
import $ from "jquery";
import VueChartkick from 'vue-chartkick'
import Vue from 'vue'
import Chart from 'chart.js'
import VTooltip from 'v-tooltip'
import PrettyCheck from 'pretty-checkbox-vue/check';
import PrettyRadio from 'pretty-checkbox-vue/radio';
import vSelect from 'vue-select'

Vue.component('v-select', vSelect);
Vue.component('p-radio', PrettyRadio);
Vue.component('p-check', PrettyCheck);
Vue.use(VTooltip);
Vue.use(VueChartkick, {adapter: Chart});

async function getKeywords() {
    return await $.get(`/keywordsplain/`);
}

async function getFylker() {
    return await $.get(`/fylker/`);
}

async function getKommuner() {
    return await $.get(`/kommuner/`);
}

async function getLineChartKeywords(val, keys, all) {
    return keys === "" || keys === "!" ? [] : await $.get(`/linechart-keywords/${val}/!${keys}/${all}/`);
}

async function getMaxPosted() {
    return await $.get(`/maxposted/`);
}

async function getKeywordStats(keys) {
    return await $.get(`/keywords/!${keys}`);
}

async function getBusinesses(keywords, fylker, kommuner, search, postedMin, postedMax, take, drop, groupCompanies) {
    search = search === "" ? "!" : search;
    console.log(keywords);
    keywords = keywords === "" ? "!" : keywords;
    fylker = fylker === "" ? "!" : fylker;
    kommuner = kommuner === "" ? "!" : kommuner;
    postedMax = isNaN(postedMax)||postedMax==="" ? 0 : postedMax;
    postedMin = isNaN(postedMin)||postedMin==="" ? 0 : postedMin;
    return await $.get(`/businesses/${keywords}/${fylker}/${kommuner}/${search}/${postedMin}/${postedMax}/${take}/${drop}/${groupCompanies}/`);
}


Vue.component('ad-stats', {});

var app = new Vue({
        el: '#app',
        data: {
            page: 'statistics',
            keywordsPlain: [],
            loading: false,
            minimize: false,
            fylker: [],
            kommuner: [],
            bp: {
                loaded: [],
                fylker: [],
                kommuner: [],
                keywords: [],
                postedMin: 0,
                postedMax: 3000,
                toTake: 25,
                search: "",
                lastSearch: false,
                groupCompanies: false,
                noResult: false
            },
            onBottomOfPage: false,
            searchKeywords: '',
            selectedKeys: ['JavaScript', 'CSS'],
            loadedKeywords: [],
            lineChartOptions: {
                library: {
                    scales: {
                        yAxes: [{scaleLabel: {fontColor: "F8F8F8"}, ticks: {fontColor: "#F8F8F8", maxTicksLimit: 20}}],
                        xAxes: [{scaleLabel: {fontColor: "F8F8F8"}, ticks: {fontColor: "#F8F8F8"}}],
                    },
                    legend: {labels: {fontColor: "#F8F8F8"}}
                },
                onlyKeyedAds: {
                    label: "Kun annonser med teknologier",
                    value: true,
                    tooltip: `Velg å kun ta med stillinger som inneholder minst en teknologi. <br> Noen stillingsannonser er veldig generell og inneholder ikke teknologier. <br> Datasettet kan inneholde noen ingeniør-stillinger som ikke er it-relatert.`
                },
                selectedDataset: {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
                dataset: [
                    {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
                    {label: "Antall", value: "freq", axisTitle: "Antall", suffix: ""}
                ]
            },
        },
        computed: {
            isMobile: function () {
                return window.innerWidth < 768;
            },
            cKommuner: function () {
                return [...new Set(this.bp.fylker.slice().map(e=>this.kommuner[e]).reduce((a,b)=>a.concat(b),[]).sort())];
            }
        },
        watch: {
            selectedKeys() {
                this.updateLineChart();
            },
            onBottomOfPage(onBottomOfPage) {
                if (onBottomOfPage) {
                    this.updateBusinesses();
                }
            },
            'lineChartOptions.selectedDataset':
                function () {
                    this.loadedKeywords = [];
                    this.updateLineChart();
                },
            'bp.posted':

                function () {
                    this.updateBusinesses(true);
                },
            'bp.keywords':

                function () {
                    this.updateBusinesses(true);
                }
        },
        components: {
            vueSlider
        },
        methods: {
            updateLineChart() {
                this.loadedKeywords = this.loadedKeywords.filter(e => this.selectedKeys.includes(e.name));
                let prevKeywords = this.loadedKeywords.slice();
                console.log(prevKeywords);
                console.log(this.selectedKeys.filter(e => !this.loadedKeywords.some(o => o.name === e)).join("!"));
                if (this.selectedKeys.length !== 0 && this.selectedKeys.length !== this.loadedKeywords.length) {
                    getLineChartKeywords(this.lineChartOptions.selectedDataset.value,
                        this.selectedKeys.filter(e => !this.loadedKeywords.some(o => o.name === e)).join("!"),
                        !this.lineChartOptions.onlyKeyedAds.value
                    ).then(e => {console.log(e);return this.loadedKeywords = e.concat(prevKeywords)});
                }
            },
            bottomScrollHandler() {
                this.onBottomOfPage = this.bottomVisible();
            },
            init() {
                getKeywords().then(e => this.keywordsPlain = e);
            },
            initFront() {
                window.removeEventListener('scroll', this.bottomScrollHandler);
                this.page = "front";

            },
            initBusinesses() {
                this.page = "businesses";
                getKommuner().then(e=>{
                    //Couldn't get this to return an object in the API.. Slight hack
                    this.kommuner = e.reduce((a,b)=>(a[b[0]]=b[1],a),{})
                });
                getFylker().then(e => {
                    this.fylker = e;
                });
                getMaxPosted().then(e => {
                    this.bp.postedMax = e;
                    this.updateBusinesses(true);
                });
                window.addEventListener('scroll', this.bottomScrollHandler);
            }
            ,
            initStatistics() {
                window.removeEventListener('scroll', this.bottomScrollHandler);
                this.lineChartOptions.selectedDataset = this.lineChartOptions.dataset[0];
                this.page = "statistics";
                this.updateLineChart();
            }
            ,
            clearKeywords() {
                this.bp.keywords = [];
                this.bp.search = '';
                this.selectedKeys = [];
                this.searchKeywords = '';
            }
            ,
            addKeywords() {
                this.selectedKeys = this.selectedKeys.concat(this.keywordsPlain.filter(k => !this.selectedKeys.includes(k) && (this.searchKeywords === '' || k.toLowerCase().includes(this.searchKeywords.toLowerCase()))))
            },
            addKeywordsbp() {
                this.bp.keywords = this.bp.keywords.concat(this.keywordsPlain.filter(k => !this.bp.keywords.includes(k) && (this.searchKeywords === '' || k.toLowerCase().includes(this.searchKeywords.toLowerCase()))))
            },
            updateBusinesses(clear) {
                if (!(clear && this.bp.lastSearch
                    && this.bp.postedMin === this.bp.lastSearch.postedMin
                    && this.bp.postedMax === this.bp.lastSearch.postedMax
                    && this.bp.keywords.join(",") === this.bp.lastSearch.keywords.join(",")
                    && this.bp.fylker.join(",") === this.bp.lastSearch.fylker.join(",")
                    && this.bp.kommuner.join(",") === this.bp.lastSearch.kommuner.join(",")
                    && this.bp.search === this.bp.lastSearch.search
                    && this.bp.groupCompanies === this.bp.lastSearch.groupCompanies)) {
                    this.bp.lastSearch = {
                        search: this.bp.search,
                        postedMin: this.bp.postedMin,
                        postedMax: this.bp.postedMax,
                        keywords: this.bp.keywords.slice(),
                        groupCompanies: this.bp.groupCompanies,
                        fylker: this.bp.fylker.slice(),
                        kommuner: this.bp.kommuner.slice()
                    };
                    if (clear) {
                        this.bp.loaded = [];
                    }
                    this.loading = true;
                    this.bp.noResult = false;
                    getBusinesses(this.bp.keywords.join("!"),
                        this.bp.fylker.join("!"),
                        this.bp.kommuner.join("!"),
                        this.bp.search,
                        this.bp.postedMin,
                        this.bp.postedMax,
                        this.bp.loaded.length + this.bp.toTake,
                        this.bp.loaded.length,
                        this.bp.groupCompanies
                    ).then(e => {
                        this.bp.loaded = clear ? e : [].concat(this.bp.loaded).concat(e);
                        this.bp.noResult = this.bp.loaded.length === 0;
                        this.loading = false;
                    })
                }
            }
            ,
            bottomVisible() {
                const scrollY = window.scrollY;
                const visible = document.documentElement.clientHeight;
                const pageHeight = document.documentElement.scrollHeight;
                const bottomOfPage = visible + scrollY >= pageHeight;
                return bottomOfPage || pageHeight < visible;
            }
        },
        created() {
            this.init();
            this.initFront();
        }
    });