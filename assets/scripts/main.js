// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('c23e05d150117a5b82ed', {
    cluster: 'us3'
});

// var channel = pusher.subscribe('admin-updates');
// channel.bind('new-submission', function (data) {
//     vm.updateSubmissions();
// });

var channel = pusher.subscribe('student-updates');
channel.bind('round-update', function (data) {
    vm.roundUpdate(data.message);
});

var vm = new Vue({
    el: '#admin-page',
    data: {
        activeRound: false,
        round: {},
        inputWord: '',
        submitted: false,
        voted: false,
        submissions: [],
        currentVote: Number
    },
    computed: {
        inputConditions: function () {
            return this.inputWord != '';
        },
        inputConditionsV: function () {
            return this.currentVote != '';
        },
    },
    methods: {
        verify: function () {
            axios
                .get('./backend/verify.php?client=true')
                .then(function (response) {
                    if (response.data == '0' || response.data == '1') {
                        window.location.href = 'login/';
                    }
                });
        },
        query: function () {
            let self = this;
            axios.get('./backend/main.php?func=load').then(function (response) {
                if (!response.data[0] == '0') {
                    if (response.data[1] == '0') {
                        self.activeRound = true;

                        self.round = {
                            active: true,
                            id: parseInt(response.data[2]['id']),
                            notes: decodeURIComponent(response.data[2]['notes']),
                            reverse: parseInt(response.data[2]['reverse']),
                            voting: parseInt(response.data[2]['voting']) == 1 ? true : false,
                            word: decodeURIComponent(response.data[2]['word']),
                            accepting: parseInt(response.data[2]['acceptingvotes']) == 1 ? true : false
                        };

                        self.submitted = response.data[3];
                    } else {
                        self.activeRound = true;

                        self.round = {
                            active: true,
                            id: parseInt(response.data[2]['id']),
                            notes: decodeURIComponent(response.data[2]['notes']),
                            reverse: parseInt(response.data[2]['reverse']),
                            voting: parseInt(response.data[2]['voting']) == 1 ? true : false,
                            word: decodeURIComponent(response.data[2]['word']),
                            accepting: parseInt(response.data[2]['acceptingvotes']) == 1 ? true : false
                        };

                        self.voted = response.data[3];

                        response.data[4].forEach(submission => {
                            self.submissions.push({
                                id: parseInt(submission['id']),
                                submission: decodeURIComponent(submission['submission']),
                            })
                        });
                    }

                }
                $('.main-loader').fadeOut();
                $('.pad').fadeIn();
            });
        },
        roundUpdate: function (data) {
            this.submissions = [];
            this.query();
        },
        submitWord: function () {
            let self = this;
            $('#input-submit').addClass('loading');
            axios.get('./backend/main.php?func=sub&sub=' + encodeURIComponent(self.inputWord)).then(function (response) {
                if (response.data == '1') {
                    self.query();
                    $('#input-submit').removeClass('loading');
                    self.inputWord = '';
                } else {
                    console.log(response.data);
                }
            });
        },
        vote: function () {
            let self = this;
            $('#input-vote').addClass('loading');
            axios.get('./backend/main.php?func=vote&sub=' + self.currentVote).then(function (response) {
                if (response.data == '1') {
                    self.query();
                    $('#input-vote').removeClass('loading');
                } else {
                    console.log(response.data);
                }
            });
            return false;
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});