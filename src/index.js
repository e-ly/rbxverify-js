


const Roblox = require('bloxy'),
    uuidv4 = require('uuid/v4'),
    Spidey = new Roblox()
    

const inProgress = []
const verifiedUsers = []

function getProgressData(keyId) {
    return inProgress.find(progressData => 
        progressData.keyId == keyId
    )
}
function deleteProgressData(keyId) {
    let data = getProgressData(keyId)
    if (data) {
        let indexOfData = inProgress.indexOf(data)
        inProgress.splice(indexOfData, 1)
        return true 
    }
}
function addProgressData(keyId, userId) {   
    // Automatically generated a token
    let token = uuidv4().substr(1, 6)
    let progressData = {
        keyId: keyId,
        userId: userId,
        vToken: token 
    }
    inProgress.push(progressData)
    console.log(`Added data, length: ${inProgress.length}`)
    return progressData
}
function genNewVToken(keyId) {
    getProgressData(keyId).vToken = uuidv4()
    .substr(1, 6)
}
async function findTokenInProfile(userId, vToken) {
    let profile = await Spidey.getUserById(userId)

    // make sure everything is lowercase
    let token = vToken.toLowerCase(),
        blurb = profile.blurb.toLowerCase(),
        status = profile.status.toLowerCase()

    return blurb.includes(token) 
    || status.includes(token)
}
async function isUserInGroup(userId, groupId) {
    let userGroups = await Spidey.getUserGroups(userId)
    return userGroups.find(userGroup =>
        userGroup.Id == groupId 
    )
}
async function userExists(searchVl) {
    let user;
    try {
        if (typeof searchVl === 'string') user = await Spidey
        .getUserByUsername(searchVl)
        else user = await Spidey.getUserById(searchVl)
        return user
    } catch(e) { return false }
}

function unverify(keyId) {
    deleteProgressData(keyId)
    if (verifiedUsers.includes(keyId)) {
        let index = verifiedUsers.indexOf(keyId)
        verifiedUsers.splice(index, 1)
    }
    return true 
}

async function processV(keyId, userId) {

    if (verifiedUsers.includes(keyId)) {
        // User is verified, status code: 2
        return { status: 2 }
    }

    let data = getProgressData(keyId)
    if (!data) {
        // User has not been setup, status code: 0
        let data = addProgressData(keyId, userId)
        return { status: 0, vToken: data.vToken }
    } else {
        // User is awaiting verification, status code: 1
        if (await findTokenInProfile(data.userId, data.vToken)) {
            return { status: 1, success: true }
        } else return { status: 1, success: false, vToken: data.vToken }
    }

}

module.exports = {

    unverify: unverify,
    resetToken: genNewVToken,

    verify: async(keyId, userId, groupId) => {
        if (!getProgressData(keyId) && userId) {
            // Most likely the first attempt
            let user = await userExists(userId)
            if (!user) throw new Error('User does not exist.')
            if (groupId && !await isUserInGroup(userId, groupId)) throw new Error('User is not in given group.')    
        }
        return processV(keyId, userId)
    }

}


