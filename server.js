import app from "./src/app.js";

import connectDB from "./src/config/database.js"

connectDB();

app.listen(3000,()=>{
    console.log(`Server in runnig on port 3000`)
})