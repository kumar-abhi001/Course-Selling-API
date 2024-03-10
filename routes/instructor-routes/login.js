

async function loginInstructor(req, res) {
    const name = req.name;
    res.send({
        "message": `${name} your are logged in.`
    })
}

module.exports = loginInstructor;