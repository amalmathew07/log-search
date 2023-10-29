import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Table, Form, Button } from "react-bootstrap";

import "react-toastify/dist/ReactToastify.css";
import "./style.css";

const LogSearchUI = () => {
  const [pattern, setPattern] = useState("");
  const [count, setCount] = useState("");
  const [fileName, setFileName] = useState("");
  const [logs, setLogs] = useState<
    { userId: string; timestamp: string; message: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [currentPattern, setCurrentPattern] = useState("");
  const [loading, setLoading] = useState(false);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  } as Intl.DateTimeFormatOptions;
  const convertDateToWords = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", options);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!pattern.trim() || !fileName.trim()) {
        toast.error("Pattern and file name cannot be blank.");
        return;
      }

      if (count.trim() === "" || parseInt(count) <= 0) {
        toast.error("Count should not be blank and should be greater than 0.");
        return;
      }

      const queryParams = new URLSearchParams({
        pattern,
        count,
        fileName,
      }).toString();

      const apiUrl = `http://localhost:3000/logs?${queryParams}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data && data.length > 0) {
        setCurrentPage(0);
        toast.success("Data found successfully!");
      } else {
        toast.error("Data not found for the given criteria.");
      }
      setLogs(data);
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    } finally {
      setCurrentPattern(pattern);
      setLoading(false);
    }
  };

  const indexOfFirstLog = Math.max(currentPage * rowsPerPage, 0);
  const indexOfLastLog = Math.min(indexOfFirstLog + rowsPerPage, logs.length);
  const currentLogs =
    logs && Array.isArray(logs)
      ? logs.slice(indexOfFirstLog, indexOfLastLog)
      : [];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const totalPages = Math.ceil(logs.length / rowsPerPage);
  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  const buttonsPerPage = 20;
  const startPage = Math.max(currentPage - Math.floor(buttonsPerPage / 2), 0);
  const endPage = Math.min(startPage + buttonsPerPage - 1, totalPages - 1);

  const visiblePageNumbers = Array.from({ length: totalPages }, (_, i) => i)
    .slice(startPage, endPage + 1)
    .filter((i) => i >= 0 && i < totalPages);

  const highlightPattern = (text: string, pattern: string) => {
    const regex = new RegExp(`(${pattern})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  console.log("Patter", pattern);
  return (
    <div className="container mt-5 p-4 border rounded">
      <h1 className="mb-4">Log Search</h1>
      <Form className="mb-4">
        <div className="custom-grp">
          <Form.Group className="mb-3">
            <Form.Label>Pattern:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="pattern-input"
            />
            <Form.Label>Number of Matches:</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <Form.Label>File Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="filename-input"
            />
          </Form.Group>
        </div>
        <Button
          variant="primary"
          onClick={fetchData}
          className="custom-btn"
          size="lg"
        >
          Search
        </Button>
      </Form>

      {loading && (
        <div className="loader-overlay">
          <div className="loader" />
        </div>
      )}

      {logs.length > 0 && (
        <div className="table-responsive">
          <Table className="mt-4" striped bordered hover>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Date logged:</th>
                <th>Message</th>
                <th>Log</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.userId}</td>
                  <td>{convertDateToWords(log.timestamp)}</td>
                  <td>{log.message}</td>
                  <td>
                    {highlightPattern(JSON.stringify(log), currentPattern)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <div className="pagination">
        {startPage > 0 && (
          <Button onClick={handlePreviousPage} variant="primary">
            Previous
          </Button>
        )}
        {visiblePageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            variant={pageNumber === currentPage ? "primary" : "secondary"}
          >
            {pageNumber + 1}
          </Button>
        ))}
        {endPage < totalPages - 1 && (
          <Button onClick={handleNextPage} variant="primary">
            Next
          </Button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default LogSearchUI;
