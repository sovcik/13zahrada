var Session = module.exports = {
    count: 1,

    add: function() {
        Session.count += 1;
    },
    remove: function() {
        Session.count -= 1;
    }
};


