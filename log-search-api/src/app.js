const express = require("express");
const cors = require("cors");
const { getMatchedLogs } = require("./matchLogExtractor");

const app = express();
const port = 3000;
app.use(cors());
app.get("/logs", async (req, res) => {
  const pattern = req.query.pattern;
  const count = req.query.count ? parseInt(req.query.count, 10) : "";
  const fileName = req.query.fileName;

  if (!pattern || !fileName || (count !== "" && (isNaN(count) || count <= 0))) {
    return res.status(400).json({
      error:
        "Invalid parameters. Please provide fileName, pattern and count (should be greater than 0) as query parameters.",
    });
  }
  const logs = await getMatchedLogs(pattern, count, fileName, res);
  logs && logs.length > 0 ? res.status(200).send(logs) : res.status(404).send({ error: "No data found for the given criteria" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
