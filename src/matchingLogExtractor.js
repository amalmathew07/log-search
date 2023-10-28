const fs = require("fs");
const path = require("path");

const getMatchedLogs = (pattern, count, fileName, res) => {
  const logsDir = path.join(__dirname, "var", "logs");

  const files = fileName ? [fileName] : fs.readdirSync(logsDir);

  const matchedLogs = [];
  let shouldStopReading = false;
  let fileCount = 0;
  for (const file of files) {
    try {
      const filePath = path.join(logsDir, file);
      const fileSize = fs.statSync(filePath).size;

      let end = fileSize;
      const bufferSize = Math.min(fileSize, 128 * 1024);
      let incompleteLine = "";

      while (end > 0 && !shouldStopReading) {
        let start = Math.max(0, end - bufferSize);

        const readStream = fs.createReadStream(filePath, {
          start,
          end,
          highWaterMark: bufferSize,
          encoding: "utf-8",
        });

        readStream.on("readable", () => {
          let chunk;

          while ((chunk = readStream.read()) !== null && !shouldStopReading) {
            const lines = (chunk + incompleteLine).split("\n");
            incompleteLine = lines.shift();

            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i];
              try {
                if (line.toLowerCase().includes(pattern.toLowerCase())) {
                  const json = JSON.parse(line);
                  matchedLogs.push(json);
                  if (matchedLogs.length === count) {
                    sendResponse(res, matchedLogs);
                    readStream.destroy();
                    shouldStopReading = true;
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

        readStream.on("end", () => {
            fileCount++;
            if (fileCount == files.length && !shouldStopReading) {
              if (incompleteLine.toLowerCase().includes(pattern.toLowerCase())) {
                const json = JSON.parse(incompleteLine);
                matchedLogs.push(json);
                if (matchedLogs.length === count) {
                  sendResponse(res, matchedLogs);
                  shouldStopReading = true;
                }
              } else {
                sendResponse(res, matchedLogs);
              }
            }
          });

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
