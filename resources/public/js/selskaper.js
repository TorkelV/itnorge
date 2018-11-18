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
        selectedKeys: ['Java', 'SQL']
    },
    components: {
    },
    computed: {},
    asyncComputed: {
        keywordsPlain() {
            return getKeywords().then(e => e);
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
            getMaxPosted().then(e => this.bp.postedMax = e);
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