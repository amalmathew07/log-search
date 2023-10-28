const express = require("express");
const cors = require('cors');
const { getMatchedLogs } = require("./matchLogExtractor");

const app = express();
const port = 3000;
app.use(cors());
app.get("/logs", (req, res) => {
  const pattern = req.query.pattern;
  const count = parseInt(req.query.count, 10);
  const fileName = req.query.fileName;

  if (!pattern || isNaN(count)) {
    return res.status(400).json({
      error:
        "Invalid parameters. Please provide pattern and count as query parameters.",
    });
  }

  getMatchedLogs(pattern,count, fileName, res);

});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
