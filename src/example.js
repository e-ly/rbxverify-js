


const rbxVerify = require('./index')

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds))
}

function verify(key, id) {
    return new Promise((resolve, reject) => {
        rbxVerify.verify(key, id)
        .then(() => {
            sleep(5).then(() => {
                rbxVerify.verify(key)
                .then(status => {
                    resolve(`${key}#${id}: ${status.success}`)
                })
            })
        })
    }) 
}

Promise.all([
    verify('a', 1), verify('b', 2), verify('c', 3)
]).then(results => console.log(results))
