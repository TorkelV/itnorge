async function getKeywords(){
    return await $.get(`/keywordsplain/`);
}

async function getLineChartKeywords(val,keys,all){
    console.log(`/linechart-keywords/${val}/!${keys}/${all}/`)
    return await $.get(`/linechart-keywords/${val}/!${keys}/${all}/`);
}


async function getKeywordStats(keys){
    return await $.get(`/keywords/!${keys}`);
}
Vue.component('v-select', VueSelect.VueSelect);

var app = new Vue({
    el: '#app',
    data: {
        selectedKeys: ['Java','SQL'],
        lineChartOptions: {
            onlyKeyedAds: {label: "Kun annonser med nøkkelord", value: true},
            selectedDataset: {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
            dataset: [
                {label: "Prosent", value: "percent", axisTitle: "Prosent", suffix: "%"},
                {label: "Antall", value: "freq", axisTitle: "Antall", suffix: ""}
            ]
        },
        translations: {
            lineChartOptions: {
                onlyKeyedAds: "Kun annonser med nøkkelord"
            }
}

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
                !this.onlyKeyedAds
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