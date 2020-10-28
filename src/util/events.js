module.exports = {
    events: {},
    on: function(eventName, callback) {
        if (!this.events.hasOwnProperty(eventName))
            this.events[eventName] = []
        this.events[eventName].push(callback)
    },
    post: async function(eventName, args = {}) {
        if (this.events.hasOwnProperty(eventName)) {
            const allCallbacks = 
                this.events[eventName].map(
                    callback => new Promise( 
                        (resolve, reject) => { 
                            callback(resolve, reject, args)
                        })
                );
            return Promise.all(allCallbacks)
        }
    }
}