import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { Table, Form, Button } from "react-bootstrap";

import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

const LogSearchUI = () => {
  const [pattern, setPattern] = useState("");
  const [count, setCount] = useState("");
  const [fileName, setFileName] = useState("");
  const [logs, setLogs] = useState<
    { userId: string; timestamp: string; message: string }[]
  >([]);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  } as Intl.DateTimeFormatOptions;

  const convertDateToWords = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', options);
  }

  const fetchData = async () => {
    try {
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
        toast.success('Data found successfully!');
      } else {
        toast.error('Data not found for the given criteria.');
      }
      setLogs(data);
    } catch (error) {
      toast.error('Error fetching data. Please try again.');
    }
  };

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
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.userId}</td>
                  <td>{convertDateToWords(log.timestamp)}</td>
                  <td>{log.message}</td>
                  <td>{JSON.stringify(log)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default LogSearchUI;
