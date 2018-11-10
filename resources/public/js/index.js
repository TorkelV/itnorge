async function getKeywords(){
    return await $.get(`/keywordsplain/`);
}

async function getLineChartKeywords(keys){
    return await $.get(`/linechart-keywords-percent/!${keys}`);
}

async function getLineChartKeywordsAll(keys){
    return await $.get(`/linechart-keywords-percent-all/!${keys}`);
}


async function getKeywordStats(keys){
    return await $.get(`/keywords/!${keys}`);
}


var app = new Vue({
    el: '#app',
    data: {
        selectedKeys: [],
        allAds: false
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
            let fn = this.allAds ? getLineChartKeywordsAll : getLineChartKeywords;
            return fn(this.selectedKeys.join("!")).then(e=>e)
        }
    },
    watch: {
        uploaded: function(uploaded){
        }
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