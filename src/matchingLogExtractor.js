const fs = require("fs");
const path = require("path");

const getMatchedLogs = (pattern, count, fileName, res) => {
  const logsDir = path.join(__dirname, "var", "logs");

  const matchedLogs = [];
  let shouldStopReading = false; // variable to check if we should continue reading - once count is found, we can skip rest of the file

  try {
    const filePath = path.join(logsDir, fileName);
    const fileSize = fs.statSync(filePath).size;

    // Initializing end pointer for readStream to fileSize, so that we can start reading from the end
    let end = fileSize;
    // Reading in chunks for efficiency and if file size is less than 128KB, we can directly load the whole file, else split into chunks of 128KB
    const bufferSize = Math.min(fileSize, 128 * 1024);
    let incompleteLine = "";
    let incompleteLastLine = "";

    // Looping through till the end of the file or till the match is found
    while (end > 0 && !shouldStopReading) {
      // After each iteration, reset start to consider the next chunk (or the next 128 KB)
      let start = Math.max(0, end - bufferSize);

      // Create readStream with the specified start and end so that we read from the end od the file
      const readStream = fs.createReadStream(filePath, {
        start,
        end,
        highWaterMark: bufferSize,
        encoding: "utf-8",
      });
      readStream.on("readable", () => {
        let chunk;

        // If there are more chunks to read or if matches not found or if next files cannot be skipped,
        // get into the loop to do the execution line by line
        while ((chunk = readStream.read()) !== null && !shouldStopReading) {
          // Since we are reading in chunks, the first and last lines could be incomplete or not in proper format
          // In each iteration, we concat the current chunk with the previous value of incomplete line.
          // By doing so, that particular line will be complete for the next iteration
          const lines = (incompleteLastLine + chunk + incompleteLine).split("\n");

          // Now take incomplete line on the current chunk (which will be concatenated with the next chunk in next iteration)
          incompleteLine = validateIncompleteLine(incompleteLine, lines, true);
          incompleteLastLine = validateIncompleteLine(incompleteLastLine, lines, false);

          // Loop through the lines of current chunk (128KB) from the last
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            try {
              if (line.toLowerCase().includes(pattern.toLowerCase())) {
                const json = JSON.parse(line);
                matchedLogs.push(json);
                if (matchedLogs.length === count) {
                  // If pattern and count matches, send the response and also set the corresponding flags
                  // to skip further iterations of the chunk and files
                  shouldStopReading = true;
                  sendResponse(res, matchedLogs);
                  // destroy the readstream so that rest of the current chunk is not processed
                  readStream.destroy();
                  break;
                }
              }
            } catch (error) {
              console.log("Here");
              //Incomplete line, continue and will be taken care in the next iteration
            }
          }
        }
        readStream.destroy();
      });

      // This is called once a readStream is finished
      // If the readStream is destroyed, this won't get called
      readStream.on("end", () => {
        if (!shouldStopReading) {
          // In the readable case, we always checked the chunks by skipping
          // the first line of the chunk. So the first line of the file will not be processed there
          // Here we process the last incomplete line (or the first line of the file)
          // If match and count was already found, this part of the code won't execute as
          // shouldStopReading will be true
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

      readStream.on("error", () => {
        res.status(500).send({ Error: "Internal Server Error" });
      });

      // After each iteration, assign end to start so that we can process the next chunk
      // which ends where the previous chunk was started.
      // eg: lets say FileSize = 500, Iteration 1: end: 500 and start: 500-128 = 372
      // Iteration 2: end = 372 and start = 372-128 = 244 and so on till it reaches the end of file
      end = start;
    }
  } catch (error) {
    res.status(500).send({ Error: "Unable to fetch, please try again" });
  }
};

function validateIncompleteLine(incompleteLine, lines, isStart) {
  try {
    JSON.parse(incompleteLine);
    incompleteLine = '';
  } catch (err) {
    isStart ? incompleteLine = lines.shift() : lines.pop();
  }
  return incompleteLine;
}

function sendResponse(res, matchedLogs) {
  res.json(matchedLogs);
}

module.exports = { getMatchedLogs };
