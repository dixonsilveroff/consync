import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.PORT, () => {
  console.log(`ConSync backend listening on port ${config.PORT}`);
});
