var vm = new Vue({
    el: '#admin-page',
    data: {

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
            var self = this;
            axios.get('./backend/admin.php?func=load').then(function (response) {

            });
        }
    },
    beforeMount() {
        this.verify();
        this.query();
    }
});