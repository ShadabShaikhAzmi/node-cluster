const cluster = require('cluster');
const os = require('os');
const express = require('express');


const app = express();
const PORT = 9090;


if(cluster.isMaster){

    const numberOfCPUs = os.cpus().length;
    for (let i=0; i < numberOfCPUs; i++)
    {
        cluster.fork();
    } 

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Service worker ${worker.process.pid} died`);
    });

}else{

    app.get("/heavy", (req, res) => {
      console.log(`${cluster.worker.id} started`);

      let number = 0;
      let iterations = 1_000_000;

      const processChunk = () => {
        const chunkSize = 1000000; // Process 1 million iterations at a time

        for (let i = 0; i < chunkSize; i++) {
          number++;
        }

        iterations -= chunkSize;

        if (iterations > 0) {
          // Process the next chunk asynchronously
          setTimeout(processChunk, 0);
        } else {
          console.log(`${cluster.worker.id} end`);
          res.send(`${number}`);
        }
      };

      // Start processing the first chunk
      processChunk();
    });

    app.listen(PORT, () => {
        console.log(`Worker ${cluster.worker.id} listening on url: http://localhost:${PORT}`);
    });
}


// Non cluster

// app.get("/heavy", (req, res) => {

//     let number = 0;
//     let iterations = 1_000_000;

//     const processChunk = () => {
//       const chunkSize = 1000000; // Process 1 million iterations at a time

//       for (let i = 0; i < chunkSize; i++) {
//         number++;
//       }

//       iterations -= chunkSize;

//       if (iterations > 0) {
//         // Process the next chunk asynchronously
//         setTimeout(processChunk, 0);
//       } else {
//         res.send(`${number}`);
//       }
//     };

//     // Start processing the first chunk
//     processChunk();
//   });

//   app.listen(PORT, () => {
//       console.log(`Worker listening on url: http://localhost:${PORT}`);
//   });