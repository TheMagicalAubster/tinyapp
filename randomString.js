function generateRandomString() {
    let funkyURL = Math.random().toString(20).substr(2, 6);
    return funkyURL;
    }

console.log(generateRandomString());