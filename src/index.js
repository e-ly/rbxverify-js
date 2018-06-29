


const Roblox = require('bloxy'),
    randomWords = require('random-words')  

const inProgress = []
const verifiedUsers = []

function randomWrds() {
    return randomWords({ exactly: 5}).join(' ')
}

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
    let token = randomWrds()
    let progressData = {
        keyId: keyId,
        userId: userId,
        vToken: token 
    }
    inProgress.push(progressData)
    return progressData
}
function genNewVToken(keyId) {
    getProgressData(keyId).vToken = randomWrds()
}
function findTokenInProfile(userId, vToken, spidey) {
    return new Promise((resolve) => {
        spidey.getUserById(userId)
        .then(profile => {
            let token = vToken.toLowerCase(),
            blurb = profile.blurb.toLowerCase(),
            status = profile.status.toLowerCase()
    
            resolve(blurb.includes(token) || 
                status.includes(token)
            )
        })
    })  
}
async function isUserInGroup(userId, groupId, spidey) {
    let userGroups = await spidey.getUserGroups(userId)
    return userGroups.find(userGroup =>
        userGroup.Id == groupId 
    )
}
async function userExists(searchVl, spidey) {
    let user;
    try {
        if (typeof searchVl === 'string') user = await spidey
        .getUserByUsername(searchVl)
        else user = await spidey.getUserById(searchVl)
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

function processV(keyId, userId, spidey) {
    return new Promise((resolve) => {
        if (verifiedUsers.includes(keyId)) {
            // User is verified, status code: 2
            resolve({ status: 2 })
        }
        let data = getProgressData(keyId)
        if (!data) {
            // User has not been setup, status code: 0
            let data = addProgressData(keyId, userId)
            resolve({ status: 0, vToken: data.vToken })
        } else {
            // User is awaiting verification, status code: 1
            findTokenInProfile(data.userId, data.vToken, spidey)
            .then(wasFound => {
                if (wasFound) resolve({ status: 1, success: true })
                else resolve({ status: 1, success: false, vToken: data.vToken })
            })
        }
    }) 
}

module.exports = {

    unverify: unverify,
    resetToken: genNewVToken,

    verify(keyId, userId, groupId) {
        return new Promise(async (resolve, reject) => {
            let spidey = new Roblox()
            if (!getProgressData(keyId) && userId) {
                let user = await userExists(userId, spidey)
                if (!user) reject('User does not exist.')
                if (groupId && !await isUserInGroup(userId, groupId, spidey)) reject('User is not in given group.')    
            }
            processV(keyId, userId, spidey)
            .then(result => resolve(result))
        })
       
    }

}


