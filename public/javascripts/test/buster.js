var config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "node", // or "browser"
    sources: [
        //"src/Num.js"
        //"lib/mylib.js",
        //"lib/**/*.js"
    ],
    tests: [
        "test/*-test.js"
    ]
}

// Add more configuration groups as needed