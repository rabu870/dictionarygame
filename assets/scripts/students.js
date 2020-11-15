var vm = new Vue({
    el: '#app',
    data: {
        users: []
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
            self.users = [];
            axios.get('./backend/students.php?func=load').then(function (response) {
                response.data[0].forEach(student => {
                    self.users.push({
                        id: parseInt(student['id']),
                        email: student['email'],
                        name: student['full_name'],
                        score: parseInt(student['score']),
                        roundScore: parseInt(student['round_points']),
                        login_key: student['login_key']
                    })
                });

                $('#adduserbutton').removeClass('loading');
                $('#scbutton').removeClass('loading');
            });
        },
        update: function () {
            $('#scbutton').addClass('loading');
            let self = this;
            axios.get('./backend/students.php?func=update&users=' + JSON.stringify(self.users)).then(function () {
                self.query();
            });
        },
        deluser: function (user) {
            let self = this;
            self.users = self.users.filter(function (obj) {
                return obj.id !== user.id;
            });
        },
        adduser: function () {
            let self = this;
            $('#adduserbutton').addClass('loading');
            axios.get('./backend/students.php?func=update&users=' + JSON.stringify(self.users)).then(function () {
                axios.get('./backend/students.php?func=adduser').then(function () {
                    self.query();
                });
            });
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});