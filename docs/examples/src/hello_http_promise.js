function main(params) {
    if(params.name && params.place) {
        return Promise.resolve({
            body: {
                greeting: `Hello ${params.name} from ${params.place}!`
            },
            statusCode: 200,
            headers: {'Content-Type': 'application/json'}
        });
    } else {
        return Promise.reject({
            body: {
                message: 'Attributes name and place are mandatory'
            },
            statusCode: 400,
            headers: {'Content-Type': 'application/json'}
        });
    }
}
