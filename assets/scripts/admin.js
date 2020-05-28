// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('c23e05d150117a5b82ed', {
    cluster: 'us3'
});

var channel = pusher.subscribe('admin-updates');
channel.bind('new-submission', function (data) {
    vm.updateSubmissions();
});

channel.bind('new-vote', function (data) {
    vm.updateVotes();
});

// var channel = pusher.subscribe('student-updates');
// channel.bind('sub-removed', function (data) {
//     alert(data.message);
// });

var vm = new Vue({
    el: '#admin-page',
    data: {
        activeRound: false,
        users: [],
        round: {},
        submissions: [],
        votes: [],
        inputWord: '',
        inputDef: '',
        inputRev: false,
        inputNotes: ''
    },
    computed: {
        inputConditions: function () {
            return this.inputWord != '' && this.inputDef != '';
        }
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
                            score: parseInt(student['score']),
                            roundScore: parseInt(student['round_points'])
                        })
                    });
                } else {
                    self.activeRound = true;
                    if (response.data[1] == '0') {
                        response.data[2].forEach(student => {
                            self.users.push({
                                id: parseInt(student['id']),
                                email: student['email'],
                                name: student['full_name'],
                                score: parseInt(student['score']),
                                roundScore: parseInt(student['round_points'])
                            })
                        });
                        response.data[3].forEach(submission => {
                            self.submissions.push({
                                id: parseInt(submission['id']),
                                isReal: parseInt(submission['is_real']) == 1 ? true : false,
                                roundId: parseInt(submission['round_id']),
                                submission: decodeURIComponent(submission['submission']),
                                userId: parseInt(submission['user_id'])
                            })
                        });

                        self.submissions.unshift(self.submissions.splice(self.submissions.findIndex(x => x.isReal), 1)[0]);

                        self.round = {
                            active: true,
                            definition: decodeURIComponent(response.data[4]['definition']),
                            id: parseInt(response.data[4]['id']),
                            notes: decodeURIComponent(response.data[4]['notes']),
                            reverse: parseInt(response.data[4]['reverse']),
                            voting: parseInt(response.data[4]['voting']) == '1' ? true : false,
                            word: decodeURIComponent(response.data[4]['word'])
                        };
                    } else {
                        response.data[2].forEach(student => {
                            self.users.push({
                                id: parseInt(student['id']),
                                email: student['email'],
                                name: student['full_name'],
                                score: parseInt(student['score']),
                                roundScore: parseInt(student['round_points'])
                            })
                        });
                        response.data[3].forEach(submission => {
                            self.submissions.push({
                                id: parseInt(submission['id']),
                                isReal: parseInt(submission['is_real']) == 1 ? true : false,
                                roundId: parseInt(submission['round_id']),
                                submission: decodeURIComponent(submission['submission']),
                                userId: parseInt(submission['user_id']),
                                votes: 0
                            })
                        });

                        self.round = {
                            active: true,
                            definition: decodeURIComponent(response.data[4]['definition']),
                            id: parseInt(response.data[4]['id']),
                            notes: decodeURIComponent(response.data[4]['notes']),
                            reverse: parseInt(response.data[4]['reverse']) == '1' ? true : false,
                            voting: parseInt(response.data[4]['voting']) == '1' ? true : false,
                            word: decodeURIComponent(response.data[4]['word']),
                            accepting: parseInt(response.data[4]['acceptingvotes']) == 1 ? true : false
                        };

                        response.data[5].forEach(vote => {
                            self.votes.push({
                                id: parseInt(vote['id']),
                                roundId: parseInt(vote['round_id']),
                                submissionId: vote['submission_id'],
                                userId: parseInt(vote['user_id'])
                            })
                        });

                        self.votes.forEach(vote => {
                            self.submissions.find(x => x.id == vote.submissionId).votes++;
                        });

                        self.submissions.sort((a, b) => (a.votes < b.votes) ? 1 : -1);
                    }
                }
                $('.main-loader').fadeOut();
                $('.pad').fadeIn();
            });
        },
        newRound: function (word, definition, reverse, notes) {
            let self = this;
            axios.get('./backend/admin.php?func=newround&word=' + encodeURIComponent(word) + '&def=' + encodeURIComponent(definition) + '&reverse=' + (reverse ? '1' : '0') + '&notes=' + encodeURIComponent(notes)).then(function (response) {
                if (response.data == '1') {
                    // self.query();
                    $('#input-submit').removeClass('loading');
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
                            submission: decodeURIComponent(sub['submission']),
                            userId: parseInt(sub['user_id'])
                        });
                    }
                });
                self.submissions.unshift(self.submissions.splice(self.submissions.findIndex(x => x.isReal), 1)[0]);
            });
        },
        compileInputs: function () {
            $('#input-submit').addClass('loading');
            this.newRound(this.inputWord, this.inputDef, this.inputRev, this.inputNotes);
        },
        rejectSub: function (sub) {
            let self = this;
            if (confirm('Are you sure you\'d like to remove the submission "' + sub.submission + '"?')) {
                sub.submission = 'removing...';
                axios.get('./backend/admin.php?func=removesub&subid=' + sub.id).then(function (response) {
                    if (response.data == '1') {
                        self.submissions.splice(self.submissions.findIndex(item => item.id == sub.id), 1);
                        alert("Removed.");
                    } else {
                        alert(response.data);
                    }
                });
            }
        },
        editSub: function (sub) {
            let self = this;
            let edit = prompt("Edit submission", sub.submission);
            if (!(edit == null || edit == '')) {
                sub.submission = 'updating...';
                axios.get('./backend/admin.php?func=updatesub&subid=' + sub.id + '&update=' + encodeURIComponent(edit)).then(function (response) {
                    if (response.data == '1') {
                        self.submissions[self.submissions.findIndex(item => item.id == sub.id)].submission = decodeURIComponent(edit);
                    } else {
                        alert(response.data);
                    }
                });
            }
        },
        fixSub: function (sub) {
            let self = this;
            let edit = sub.submission.replace(/\.$/, "");
            edit = edit[0].toLowerCase() + edit.substring(1);
            sub.submission = 'fixing...';
            axios.get('./backend/admin.php?func=autofix&subid=' + sub.id + '&update=' + encodeURIComponent(edit)).then(function (response) {
                self.submissions[self.submissions.findIndex(item => item.id == sub.id)].submission = decodeURIComponent(response.data);
            }).catch(function () {
                alert('Failed. Try again.')
            });
        },
        voting: function () {
            let self = this;
            if (confirm("Are you sure you would like to begin voting?")) {
                axios.get('./backend/admin.php?func=voting').then(function (response) {
                    if (response.data == '1') {
                        window.location.href = window.location.href;
                    } else {
                        alert(response.data);
                    }
                });
            }
        },
        updateVotes: function () {
            let self = this;

            axios.get('./backend/admin.php?func=votes').then(function (response) {

                self.votes = [];

                response.data[0].forEach(vote => {
                    self.votes.push({
                        id: parseInt(vote['id']),
                        roundId: parseInt(vote['round_id']),
                        submissionId: vote['submission_id'],
                        userId: parseInt(vote['user_id'])
                    })
                });

                let i = [];

                response.data[1].forEach(student => {
                    i.push({
                        id: parseInt(student['id']),
                        email: student['email'],
                        name: student['full_name'],
                        score: parseInt(student['score']),
                        roundScore: parseInt(student['round_points'])
                    })
                });

                self.users = i;

                let n = self.submissions.slice();

                n.forEach(x => x.votes = 0);


                self.votes.forEach(vote => {
                    n.find(x => x.id == vote.submissionId).votes++;
                });

                n.sort((a, b) => (a.votes < b.votes) ? 1 : -1);

                self.submissions = n;
            });
        },
        getVoters(sub) {
            let self = this;
            let voters = '';

            self.votes.forEach(x => {
                if (x.submissionId == sub.id) {
                    voters += self.users.find(n => n.id == x.userId).name + ', ';
                }
            });

            voters = voters.slice(0, -2);
            return voters;
        },
        endRound: function () {
            let self = this;
            if (confirm("Are you sure you would like to end this round?")) {
                axios.get('./backend/admin.php?func=endf').then(function (response) {
                    if (response.data == '1') {
                        window.location.href = window.location.href;
                    } else {
                        alert(response.data);
                    }
                });
            }
        },
        endVoting: function () {
            let self = this;
            if (confirm("Are you sure you would like to end voting?")) {
                axios.get('./backend/admin.php?func=end').then(function (response) {
                    if (response.data == '1') {
                        window.location.href = window.location.href;
                    } else {
                        alert(response.data);
                    }
                });
            }
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});