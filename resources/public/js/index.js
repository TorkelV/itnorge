async function getKeywords(){
    return await $.get(`/keywordsplain/`);
}

async function getLineChartKeywords(val,keys,all){
    console.log(`/linechart-keywords/${val}/!${keys}/${all}/`);
    return await $.get(`/linechart-keywords/${val}/!${keys}/${all}/`);
}


async function getKeywordStats(keys){
    return await $.get(`/keywords/!${keys}`);
}
Vue.component('v-select', VueSelect.VueSelect);
Vue.use(VTooltip)

var app = new Vue({
    el: '#app',
    data: {
        searchKeywords: '',
        selectedKeys: ['Java', 'SQL'],
        lineChartOptions: {
            library: {scales: {yAxes: [{ticks: {maxTicksLimit: 20}}]}},
            onlyKeyedAds: {label: "Kun annonser med nøkkelord", value: true, tooltip: `Velg å kun ta med stillinger som inneholder minst en teknologi. <br> Noen stillingsannonser er veldig generell og inneholder ikke teknologier. <br> Datasettet kan inneholde noen ingeniør-stillinger som ikke er it-relatert.`},
            selectedDataset: {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
            dataset: [
                {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
                {label: "Antall", value: "freq", axisTitle: "Antall", suffix: ""}
            ]
        }
    },
    components: {

    },
    computed: {

    },
    asyncComputed: {
        keywordStats () {
            return getKeywordStats(this.selectedKeys.join("!")).then(e=>e);
        },
        keywordsPlain () {
            return getKeywords().then(e=>e);
        },
        lineChartKeywords () {
            return getLineChartKeywords(this.lineChartOptions.selectedDataset.value,
                this.selectedKeys.join("!"),
                !this.lineChartOptions.onlyKeyedAds.value
            ).then(e=>e)
        }
    },
    watch: {

    },
    methods: {
        location (mountainid) {
            location.href="guestbook.html?mountainid="+mountainid
        },
        locationLeaders (mountainid){
            location.href="leaders.html?mountainid="+mountainid
        }
    }
})