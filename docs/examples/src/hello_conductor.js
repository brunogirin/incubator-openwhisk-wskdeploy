// Licensed to the Apache Software Foundation (ASF) under one or more contributor
// license agreements; and to You under the Apache License, Version 2.0.

/*
 * Simple conductor action that calls hello or hello_plus depending on
 * the parameters it's been given.
 */
function main(params) {
    const step = params.$step || 0;
    switch(step) {
        case 0:
            const name = params.name || 'stranger';
            const place = params.place || 'Earth';
            if(params.children && params.height) {
                return {
                    action: 'hello_plus',
                    params: {
                        name: name,
                        place: place,
                        children: params.children,
                        height: params.height
                    },
                    state: {
                        $step: 1
                    }
                }
            } else {
                return {
                    action: 'hello_world',
                    params: {
                        name: name,
                        place: place
                    },
                    state: {
                        $step: 1
                    }
                }
            }
        default:
            delete params.$step;
            return params;
    }
}
