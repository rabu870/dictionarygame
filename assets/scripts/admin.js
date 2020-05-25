// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('c23e05d150117a5b82ed', {
    cluster: 'us3'
});

var channel = pusher.subscribe('admin-updates');
channel.bind('new-submission', function (data) {
    vm.updateSubmissions();
});

var vm = new Vue({
    el: '#admin-page',
    data: {
        activeRound: false,
        users: [],
        round: {},
        submissions: [],
        votes: []
    },
    methods: {
        verify: function () {
            axios
                .get('./backend/verify.php?client=true')
                .then(function (response) {
                    if (response.data == '0') {
                        window.location.href = 'login/';
                    } else if (response.data == '2') {
                        window.location.href = 'https://youtu.be/dQw4w9WgXcQ';
                    }
                });
        },
        query: function () {
            let self = this;
            axios.get('./backend/admin.php?func=load').then(function (response) {
                if (response.data[0] == '0') {
                    response.data[1].forEach(student => {
                        self.users.push({
                            id: parseInt(student['id']),
                            email: student['email'],
                            name: student['full_name'],
                            score: parseInt(student['score'])
                        })
                    });
                } else {
                    self.activeRound = true;
                    response.data[1].forEach(student => {
                        self.users.push({
                            id: parseInt(student['id']),
                            email: student['email'],
                            name: student['full_name'],
                            score: parseInt(student['score'])
                        })
                    });
                    response.data[2].forEach(submission => {
                        self.submissions.push({
                            id: parseInt(submission['id']),
                            isReal: parseInt(submission['is_real']) == 1 ? true : false,
                            roundId: parseInt(submission['round_id']),
                            submission: submission['submission'],
                            userId: parseInt(submission['user_id'])
                        })
                    });

                    self.round = {
                        active: true,
                        definition: response.data[3]['definition'],
                        id: parseInt(response.data[3]['id']),
                        notes: response.data[3]['notes'],
                        reverse: parseInt(response.data[3]['reverse']),
                        voting: parseInt(response.data[3]['voting']),
                        word: response.data[3]['word']
                    };
                }
            });
        },
        newRound: function (word, definition, reverse, notes) {
            axios.get('./backend/admin.php?func=newround&word=' + encodeURIComponent(word) + '&def=' + encodeURIComponent(definition) + '&reverse=' + (reverse ? '1' : '0') + '&notes=' + encodeURIComponent(notes)).then(function (response) {
                if (response.data == '1') {
                    window.location.href = window.location.href;
                } else {
                    alert('response.data');
                }
            });
        },
        updateSubmissions: function () {
            let self = this;
            axios.get('./backend/admin.php?func=submissions').then(function (response) {
                response.data.forEach(sub => {
                    let i = true;
                    self.submissions.forEach(old => {
                        if (old.id == sub.id) {
                            i = false;
                        }
                    });
                    if (i) {
                        self.submissions.push({
                            id: parseInt(sub['id']),
                            isReal: parseInt(sub['is_real']) == 1 ? true : false,
                            roundId: parseInt(sub['round_id']),
                            submission: sub['submission'],
                            userId: parseInt(sub['user_id'])
                        });
                    }
                });
            });
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});