const fs = require("fs");
const path = require("path");

const getMatchedLogs = (pattern, count, fileName, res) => {
  const logsDir = path.join(__dirname, "var", "logs");

  const files = fileName ? [fileName] : fs.readdirSync(logsDir);

  const matchedLogs = [];
  for (const file of files) {
    try {
      const filePath = path.join(logsDir, file);
      const fileSize = fs.statSync(filePath).size;

      let end = fileSize;
      const bufferSize = Math.min(fileSize, 128 * 1024);

      while (end > 0) {
        let start = Math.max(0, end - bufferSize);

        const readStream = fs.createReadStream(filePath, {
          start,
          end,
          highWaterMark: bufferSize,
          encoding: "utf-8",
        });

        readStream.on("readable", () => {
          let chunk;

          while ((chunk = readStream.read()) !== null) {
            const lines = chunk.split("\n");

            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i];
              try {
                if (line.toLowerCase().includes(pattern.toLowerCase())) {
                  const json = JSON.parse(line);
                  matchedLogs.push(json);
                  if (matchedLogs.length === count) {
                    sendResponse(res, matchedLogs);
                    readStream.destroy();
                    break;
                  }
                }
              } catch (error) {
                console.log("Here");
              }
            }
          }
          readStream.destroy();
        });

        readStream.on("end", () => {});

        readStream.on("error", (error) => {
          res.status(500).send({ Error: "Internal Server Error" });
        });

        end = start;
      }
    } catch (error) {
      res.status(500).send({ Error: "Unable to fetch, please try again" });
    }
  }
};

function sendResponse(res, matchedLogs) {
  res.json(matchedLogs);
}

module.exports = { getMatchedLogs };
