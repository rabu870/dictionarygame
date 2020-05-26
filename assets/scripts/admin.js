// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('c23e05d150117a5b82ed', {
    cluster: 'us3'
});

var channel = pusher.subscribe('admin-updates');
channel.bind('new-submission', function (data) {
    vm.updateSubmissions();
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

                    self.submissions.unshift(self.submissions.splice(self.submissions.findIndex(x => x.isReal), 1)[0]);

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
                $('.main-loader').fadeOut();
                $('.pad').fadeIn();
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
                        self.submissions[self.submissions.findIndex(item => item.id == sub.id)].submission = edit;
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
            alert(edit);
            sub.submission = 'fixing...';
            axios.get('./backend/admin.php?func=autofix&subid=' + sub.id + '&update=' + encodeURIComponent(edit)).then(function (response) {
                self.submissions[self.submissions.findIndex(item => item.id == sub.id)].submission = response.data;
            }).catch(function () {
                alert('Failed. Try again.')
            });
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});