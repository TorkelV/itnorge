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

Vue.component('v-select', VueSelect.VueSelect);
Vue.use(VTooltip);

var app = new Vue({
    el: '#app',
    data: {
        bp: {
            loaded: [],
            keywords: [],
            postedMin: 0,
            postedMax: 0,
            toTake: 25,
            search: ""
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
    watch: {
        onBottomOfPage(onBottomOfPage) {
            if (onBottomOfPage) {
                this.updateBusinesses();
            }
        }
    },
    methods: {
        updateBusinesses() {
            getBusinesses(this.bp.keywords.join("!"),
                    this.bp.search,
                    this.bp.postedMin,
                    this.bp.postedMax,
                    this.bp.loaded.length + this.bp.toTake,
                    this.bp.loaded.length
                ).then(e => this.bp.loaded = [].concat(this.bp.loaded).concat(e));
        },
        setMaxPosted() {
          getMaxPosted().then(e=> this.bp.postedMax = e);
        },
        clearKeywords() {
            this.selectedKeys = [];
            this.searchKeywords = '';
        },
        addKeywords() {
            this.selectedKeys = this.selectedKeys.concat(this.keywordsPlain.filter(k => !this.selectedKeys.includes(k) && (this.searchKeywords === '' || k.toLowerCase().includes(this.searchKeywords.toLowerCase()))))
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
        this.updateBusinesses();
        this.setMaxPosted();
        window.addEventListener('scroll', () => {
            this.onBottomOfPage = this.bottomVisible();
        });
    }
});