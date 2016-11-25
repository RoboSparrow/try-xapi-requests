/* global req,CONFIG */
(function(window, document, req, CONFIG) {
    'use strict';

    let getLrs = (endpoint) => {
        for(let i = 0; i < CONFIG.lrs.length; i++){
            console.log(CONFIG.lrs[i].endpoint,  endpoint);
            if(CONFIG.lrs[i].endpoint === endpoint){
                return CONFIG.lrs[i];
            }
        }
        return false;
    };

    let setLrs = (lrs) => {
        req.xapi.LRS = lrs.endpoint;
        req.xapi.AUTH = 'Basic ' + btoa(lrs.auth);
        req.xapi.VERSION = lrs.version;
    };

    let sanitizeString = (value) => {
        if(!value){
            return '';
        }
        return value.replace(/\r?\n|\r/g, '').trim();
    };

    let handleForm = (form) => {

        let smtId = form.elements.namedItem('statementId');

        if(smtId && smtId.type === 'text'.toLowerCase()){
            smtId = req.xapi.uuid();
        }

        form.addEventListener('submit', function(e){
            e.preventDefault();

            let method = this.elements.namedItem('method').value;
            let data = this.elements.namedItem('data');
            let query = this.elements.namedItem('query');
            let raw = this.elements.namedItem('invalidJson').checked;

            let statementId = this.elements.namedItem('statementId');//PUT only

            let output = form.querySelector('.result');
            output.className = 'result';
            output.textContent = '';

            let alert = form.querySelector('.alert');
            alert.className = 'alert';
            alert.innerHTML = '';

            query = (query) ? query.value : null;
            if(query && !raw){
                try {
                    query = JSON.parse(sanitizeString(query));
                }catch(err){
                    alert.innerHTML = 'JSON parser error: ' + err.message;
                    alert.className = 'alert alert-danger';
                    return; //!
                }
            }

            data = (data) ? data.value : null;
            if(data && !raw){
                try {
                    data = JSON.parse(sanitizeString(data));
                }catch(err){
                    alert.innerHTML = 'JSON parser error: ' + err.message;
                    alert.className = 'alert alert-danger';
                    return; //!
                }
            }

            let options = {
                method: method,
                query: {},
                success: function(result) {
                    output.className = 'result text-success';
                    output.textContent = JSON.stringify(result, null, 4);

                    alert.className = 'alert alert-success';
                    alert.innerHTML = `[${result.status}] ${result.statusText}`;
                },
                error: function(result) {
                    output.className = 'result text-danger';
                    output.textContent = JSON.stringify(result, null, 4);

                    alert.className = 'alert alert-danger';
                    alert.innerHTML = `[${result.status}] ${result.statusText}`;
                }
            };

            if(query){
                options.query = query;
            }
            if(statementId){
                options.query.statementId = statementId.value;
            }
            if(data){
                options.data = data;
            }
            if(!raw){
                req.xapi('/statements', options);
            }else{
                let url = req.xapi.getEndpoint('/statements');
                let _q = sanitizeString(query);
                if(_q){
                    url += '?' + encodeURI(_q);
                }
                query = {};
                options.headers = req.xapi.getHeaders();
                req.raw(url, options);
            }

        });

    };

    let handleLrsForm = (form) => {
        let select = form.elements.namedItem('endpoint');
        let option;

        for(let i = 0; i < CONFIG.lrs.length; i++){
             option = document.createElement('option');
             option.value = CONFIG.lrs[i].endpoint;
             option.textContent = CONFIG.lrs[i].endpoint;
             option.selected = (req.xapi.LRS === CONFIG.lrs[i].endpoint);
             select.appendChild(option);
        }

        select.addEventListener('change', (e) => {
            let endpoint = e.target.options[e.target.selectedIndex].value;
            let lrs = getLrs(endpoint);
            setLrs(lrs);
            document.getElementById('current-lrs').innerHTML = `lrs: ${req.xapi.LRS}, xAPI version: ${req.xapi.VERSION}`;
        });

    };

    document.addEventListener('DOMContentLoaded', function() {
        setLrs(CONFIG.lrs[0]);
        document.getElementById('current-lrs').innerHTML = `lrs: ${req.xapi.LRS}, xAPI version: ${req.xapi.VERSION}`;
        handleLrsForm(document.getElementById('lrs-config-form'));

        handleForm(document.getElementById('statement-get'));
        handleForm(document.getElementById('statement-post'));
        handleForm(document.getElementById('statement-put'));
    });

})(window, document, req, CONFIG);
