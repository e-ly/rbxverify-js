


const rbxVerify = require('./index')

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds))
}

// Anything, i.e. discordId
let myKeyId = 'randomKey'
let targetUserId = 1
rbxVerify.verify(myKeyId, targetUserId)
.then(async status => {
    
    console.log(
        `Put this in your blurb or status!\n` +
        `Token: ${status.vToken}`
    )

    // Wait ten seconds
    await sleep(10)

    let status2 = await rbxVerify.verify(myKeyId)
    console.log(
        `Attempt Results:\n` +
        `Success: ${status2.success}`
        //`${!status.success && 'vToken:' + status.vToken || ''}`
    )

})
