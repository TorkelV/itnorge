async function getKeywords(){
    return await $.get(`/keywordsplain/`);
}

async function getKeywordStats(){
    return await $.get(`/keywords/!`);
}


var app = new Vue({
    el: '#app',
    data: {

    },
    computed: {
        mountainid () {
            return jQuery.url().param("mountainid");
        }
    },
    asyncComputed: {
        keywordStats () {
            return getKeywordStats().then(e=>e);
        },
        keywordsPlain () {
            return getKeywords().then(e=>e);
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