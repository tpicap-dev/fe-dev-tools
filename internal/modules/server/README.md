# Server Documentation

## Overview

This is a Deno-based server application utilizing the Oak framework to provide a range of APIs for managing logs, storage, project information, and executing shell commands.

### Features:
- **Logging**: Endpoints for logging data.
- **Storage Management**: Store, retrieve, and clear stored items.
- **Git Integration**: Access git commit information.
- **Project Information**: Retrieve metadata about the project.
- **Shell Execution**: Execute shell commands and retrieve the output.

---

## Prerequisites

### Installation Requirements
- **Deno** (Make sure [Deno](https://deno.land/) is installed on your system.)
- **Port**: The server runs on port `8080` by default.

### Modules Used
The application relies on the following key modules:
- **[Oak v12.6.1](https://deno.land/x/oak)**: A middleware framework for Deno’s HTTP server.
- **Deno kv**: A simple key-value database for Deno.

---

## Endpoints

### **Logging**
- **POST `/storage/log/:key`**
    - Log data to a specified key.
    - **Request Body**: JSON object containing the log data.
    - **Response**:
        - `200`: Log saved successfully.
        - `500`: Internal server error.

---

### **Storage**
- **POST `/storage/set/:key`**
    - Store data at a specified key.
    - **Request Body**: JSON or raw data.
    - **Response**:
        - `200`: Data stored successfully.
        - `500`: Internal server error.

- **GET `/storage/get/:key`**
    - Retrieve data stored under a specified key.
    - **Response**:
        - `200`: JSON object of the stored data or an empty object if not found.
        - `500`: Internal server error.

- **GET `/storage/clear/:key`**
    - Clear/remove stored data by the specified key.
    - **Response**:
        - `200`: Data cleared successfully.
        - `500`: Internal server error.

---

### **Git Functions**
- **GET `/git/summary`**
    - Retrieve the latest commit information from the repository.
    - **Response**:
        - `200`: JSON with commit information.
        - `500`: Internal server error.

---

### **Project Information**
- **GET `/project-info`**
    - Fetch metadata about the project (e.g., name, paths, configuration).
    - **Response**:
        - `200`: JSON with project details.
        - `500`: Internal server error.

---

### **Shell Execution**
- **GET `/sh/:command`**
    - Execute a shell command and retrieve the standard output.
    - **Response**:
        - `200`: Command output in plain text.
        - `500`: Internal server error.

---

## Running the Server

1. Start the Deno server by running:
```
deno run --allow-net --allow-read --allow-env --allow-write ./path/to/server.ts
```


2. The server will run on `http://127.0.0.1:8080`.