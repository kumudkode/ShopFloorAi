import { Database } from "bun:sqlite";
import { join } from "node:path";

try {
    const db = new Database(join(process.cwd(), "factory.sqlite"));

    console.log("Testing db.query...");
    const q1 = db.query("SELECT count(*) as count FROM workers");
    console.log("Query result:", q1.get());

    console.log("Testing db.prepare...");
    if (typeof db.prepare === 'function') {
        const q2 = db.prepare("SELECT count(*) as count FROM workers");
        console.log("Prepare result:", q2.get());
    } else {
        console.log("db.prepare is NOT a function");
    }

    // Test parameter binding with spread
    console.log("Testing spread params...");
    const q3 = db.query("SELECT * FROM workers WHERE worker_id = ?");
    console.log("Spread result:", q3.all(...["W1"]));

} catch (error) {
    console.error("Error reading DB:", error);
}
