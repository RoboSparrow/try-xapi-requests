const CONFIG = {
    lrs: [
        {
            name: '<name>',
            endpoint: '<lrs-url>',
            auth: '<user>:<password>',
            version: '1.0.2'
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
