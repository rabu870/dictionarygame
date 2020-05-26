// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('c23e05d150117a5b82ed', {
    cluster: 'us3'
});

// var channel = pusher.subscribe('admin-updates');
// channel.bind('new-submission', function (data) {
//     vm.updateSubmissions();
// });

// var channel = pusher.subscribe('student-updates');
// channel.bind('sub-removed', function (data) {
//     alert(data.message);
// });

var vm = new Vue({
    el: '#admin-page',
    data: {
        activeRound: false,
        round: {}
    },
    methods: {
        verify: function () {
            axios
                .get('./backend/verify.php?client=true')
                .then(function (response) {
                    if (response.data == '0' || response.data == '2') {
                        window.location.href = 'login/';
                    }
                });
        },
        query: function () {
            let self = this;
            axios.get('./backend/main.php?func=load').then(function (response) {
                if (!response.data[0] == '0') {
                    self.activeRound = true;
                }
                $('.main-loader').fadeOut();
                $('.pad').fadeIn();
            });
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});