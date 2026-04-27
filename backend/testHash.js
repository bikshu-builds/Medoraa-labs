const bcrypt = require("bcryptjs");

async function run() {
    const p = "emp2@medoraa.com";
    const hashed = await bcrypt.hash(p, 10);
    console.log("hashed:", hashed);
}
run();
