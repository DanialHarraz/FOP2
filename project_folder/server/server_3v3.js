// Name : Danial Harraz
// Class: DIT/1B/04
// Admin No: 2322852


const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const parse = require('csv-parse').parse;

app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '..', 'public')));


let carParkData;

async function readAllCarPark() {
  return new Promise((resolve, reject) => {
    const rData = [];

    fs.createReadStream('./data/HDBCarparkInformation.csv')
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', function (csvrow) {
        let newRecord = {
          car_park_no: csvrow[0],
          address: csvrow[1],
          x_coord: csvrow[2],
          y_coord: csvrow[3],
          car_park_type: csvrow[4],
          type_of_parking_system: csvrow[5],
          short_term_parking: csvrow[6],
          free_parking: csvrow[7],
          night_parking: csvrow[8],
          car_park_decks: parseInt(csvrow[9]),
          gantry_height: parseFloat(csvrow[10]),
          car_park_basement: csvrow[11],
        };
        rData.push(newRecord);
      })
      .on('end', function () {
        resolve(rData);
      })
      .on('error', function (err) {
        reject(err);
      });
  });
}



// This responds with " Nothing" on the homepage
app.get('/', function (req, res) {
  console.log('Host data ready');
  res.send('Your Data Host!');
});

//OPTION 1
// Endpoint all car parks e.g. http://localhost:8081/readAllCarPark
app.get('/readAllCarPark', function (req, res) {
  console.log('All Car Park Data');
  res.send(carParkData);
});




//OPTION 2
//Endpoint to  get a list of carpark types
app.get('/getCarparkTypes', (req, res) => {
  const carparkTypes = Array.from(new Set(carParkData.map((carparkInfo) => carparkInfo.car_park_type)));
  res.status(200);
  res.type('application/json');
  res.json(carparkTypes);
});


// Endpoint Query Car Park Type e.g. http://localhost:8081/byType/BASEMENT%20CAR%20PARK
app.get('/byType/:type', (req, res) => {
  let carParkType = req.params.type;
  console.log(carParkType);

  const result = carParkData.filter((carparkInfo) => {
    return carparkInfo.car_park_type == carParkType;
  });

  res.status(200);
  res.type('application/json');
  res.json(result);
});

// Endpoint to get car parks by type and distance
app.get('/byTypeAndDistance/:type/:userLat/:userLon', (req, res) => {
  const selectedCarparkType = req.params.type;
  const userLat = parseFloat(req.params.userLat);
  const userLon = parseFloat(req.params.userLon);

  

  // Implement logic to get car parks by type and distance
  const carParksByDistance = carParkData
    .filter(carparkInfo => carparkInfo.car_park_type === selectedCarparkType)
    .map(carparkInfo => {
      const carparkLat = parseFloat(carparkInfo.y_coord);
      const carparkLon = parseFloat(carparkInfo.x_coord);

      // Calculate distance using Haversine formula
      const distance = calculateHaversineDistance(userLat, userLon, carparkLat, carparkLon);

      return {
        ...carparkInfo,
        distance,
      };
    })
    .sort((a, b) => a.distance - b.distance); // Sort by distance

  res.json(carParksByDistance);
});

// Haversine formula to calculate distance between two points on the Earth
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}






//OPTION 3
// Endpoint to get a list of parking system types
app.get('/getParkingSystemTypes', (req, res) => {
  const parkingSystemTypes = Array.from(new Set(carParkData.map((carparkInfo) => carparkInfo.type_of_parking_system)));
  res.status(200);
  res.type('application/json');
  res.json(parkingSystemTypes);
});

// Endpoint Query Parking System Type
app.get('/byParkingSystem/:parkingSystemType', (req, res) => {
  let parkingSystemType = req.params.parkingSystemType;
  console.log(parkingSystemType);

  const result = carParkData.filter((carparkInfo) => {
    return carparkInfo.type_of_parking_system === parkingSystemType;
  });

  res.status(200);
  res.type('application/json');
  res.json(result);
});



// Modify the /byParkingSystem/:parkingSystemType endpoint
app.get('/byParkingSystem/:parkingSystemType/:userLat/:userLon', async (req, res) => {
  try {
    const selectedparkingSystemType = req.params.parkingSystemType;
    const userLat = parseFloat(req.params.userLat);
    const userLon = parseFloat(req.params.userLon);

    // Get car parks by parking system type
    const carParksByParkingSystemType = carParkData.filter((carparkInfo) => {
      return carparkInfo.type_of_parking_system === selectedparkingSystemType;
    });

    // Calculate distance for each car park
    const carParksWithDistance = carParksByParkingSystemType.map((carparkInfo) => {
      const carparkLat = parseFloat(carparkInfo.y_coord);
      const carparkLon = parseFloat(carparkInfo.x_coord);
      const distance = calculateHaversineDistance(userLat, userLon, carparkLat, carparkLon);

      return {
        ...carparkInfo,
        distance,
      };
    });

    // Sort car parks by distance
    const sortedCarParks = carParksWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200);
    res.type('application/json');
    res.json(sortedCarParks);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Haversine formula to calculate distance between two points on the Earth
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}




//OPTION 4
// Endpoint to get a list of free parking types
app.get('/getFreeParkingTypes', (req, res) => {
  const carparkTypes = Array.from(new Set(carParkData.map((carparkInfo) => carparkInfo.free_parking)));
  res.status(200);
  res.type('application/json');
  res.json(carparkTypes);
});


// Endpoint Query Free Parking Type
// e.g., http://localhost:8081/byFreeParkingType/NUMBER
app.get('/byFreeParkingType/:freeParkingType', (req, res) => {
  let freeParkingType = req.params.freeParkingType;
  console.log(freeParkingType);

  const result = carParkData.filter((carparkInfo) => {
    return carparkInfo.free_parking.includes(freeParkingType);
  });

  res.status(200);
  res.type('application/json');
  res.json(result);
});





//OPTION 5
// Endpoint to get car parks with night parking
// e.g., http://localhost:8081/withNightParking
app.get('/withNightParking', (req, res) => {
  const carParksWithNightParking = carParkData.filter((carparkInfo) => {
    return carparkInfo.night_parking === 'YES';
  });

  res.status(200);
  res.type('application/json');
  res.json(carParksWithNightParking);
});



//OPTION 6
// Endpoint to get car parks based on area
app.get('/byArea/:topLeftX/:topLeftY/:bottomRightX/:bottomRightY', (req, res) => {
  const { topLeftX, topLeftY, bottomRightX, bottomRightY } = req.params;

  const result = carParkData.filter((carparkInfo) => {
    const x = parseFloat(carparkInfo.x_coord);
    const y = parseFloat(carparkInfo.y_coord);

    return x >= parseFloat(topLeftX) &&
           x <= parseFloat(bottomRightX) &&
           y >= parseFloat(topLeftY) &&
           y <= parseFloat(bottomRightY);
  });

  res.status(200);
  res.type('application/json');
  res.json(result);
});




//OPTION 7
// Endpoint to get car parks based on number prefix
app.get('/byPrefix/:prefix', (req, res) => {
  let prefix = req.params.prefix;
  console.log(prefix);

  if(prefix.length == 1) {

  let result = carParkData.filter((carparkInfo) => {
    return carparkInfo.car_park_no.charAt(0).toUpperCase() === prefix.toUpperCase();
  });

  res.status(200);
  res.type('application/json');
  res.json(result);
} else {

    result = carParkData.filter(carparkInfo => carparkInfo.car_park_no.toUpperCase().startsWith(prefix));


}
res.status(200);
res.type('application/json');
res.json(result);



});



// Endpoint to get car parks by prefix and distance
app.get('/byPrefixAndDistance/:prefix/:userLat/:userLon', (req, res) => {
    const selectedCarparkPrefix = req.params.prefix;
    const userLat = parseFloat(req.params.userLat);
    const userLon = parseFloat(req.params.userLon);

    // Implement logic to get car parks by prefix and distance
    const carParksByDistance = carParkData
        .filter(carparkInfo => carparkInfo.car_park_no.startsWith(selectedCarparkPrefix.toUpperCase()))
        .map(carparkInfo => {
            const carparkLat = parseFloat(carparkInfo.y_coord);
            const carparkLon = parseFloat(carparkInfo.x_coord);

            // Calculate distance using Haversine formula
            const distance = calculateHaversineDistance(userLat, userLon, carparkLat, carparkLon);

            return {
                ...carparkInfo,
                distance,
            };
        })
        .sort((a, b) => a.distance - b.distance); // Sort by distance

    res.json(carParksByDistance);
});

// Haversine formula to calculate distance between two points on the Earth
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}




//OPTION 8
// Endpoint Query Gantry Height > parameter e.g. http://localhost:8081/byGantryHeight/1.8
app.get('/byGantryHeight/:gantry_height', (req, res) => {
  let gantryHeight = parseFloat(req.params.gantry_height);
  console.log(gantryHeight);

  if (!isNaN(gantryHeight)) {
    const result = carParkData.filter((carparkInfo) => {
      return carparkInfo.gantry_height >= gantryHeight;
    });
    res.status(200);
    res.type('application/json');
    res.json(result);
  } else {
    res.status(400);
    res.send();
  }
});




// Endpoint to get car parks by gantry height and distance
app.get('/byGantryHeightAndDistance/:gantryHeight/:userLat/:userLon', (req, res) => {
    const selectedCarparkGantryHeight = req.params.gantryHeight;
    const userLat = parseFloat(req.params.userLat);
    const userLon = parseFloat(req.params.userLon);

    // Implement logic to get car parks by gantry height and distance
    const carParksByDistance = carParkData
        .filter(carparkInfo => carparkInfo.gantry_height >= selectedCarparkGantryHeight)
        .map(carparkInfo => {
            const carparkLat = parseFloat(carparkInfo.y_coord);
            const carparkLon = parseFloat(carparkInfo.x_coord);

            // Calculate distance using Haversine formula
            const distance = calculateHaversineDistance(userLat, userLon, carparkLat, carparkLon);

            return {
                ...carparkInfo,
                distance,
            };
        })
        .sort((a, b) => a.distance - b.distance); // Sort by distance

    res.json(carParksByDistance);
});








// Haversine formula to calculate distance between two points on the Earth
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}





// Get all information about HDB car parks
readAllCarPark()
  .then((alldata) => {
    carParkData = alldata;
    const server = app.listen(8081, 'localhost', () => {
      const host = server.address().address;
      const port = server.address().port;

      console.log(`Example app listening at http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.log('Error:', error);
  });





