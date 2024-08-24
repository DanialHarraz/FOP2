// Name : Danial Harraz
// Class: DIT/1B/04
// Admin No: 2322852


 // Define custom elements
 class FilterButton extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `<button id="filterBtn">Filter</button>`;
    }
}
class CarParkItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .accordion {
                    margin-bottom: 10px;
                }
                .accordion-item {
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                    margin-bottom: 5px;
                }
                .accordion-item-header {
                    padding: 10px;
                    cursor: pointer;
                    background-color: #f3f3f3;
                    border-bottom: 1px solid #ccc;
                }
                .accordion-item-details {
                    padding: 10px;
                    display: none;
                }
                .accordion-item-details p {
                    margin: 5px 0;
                }
            </style>
            <div class="accordion">
            </div>
        `;
    }

    connectedCallback() {
        // Add event listeners to toggle accordion details
        const accordionItems = this.shadowRoot.querySelectorAll('.accordion-item');
        accordionItems.forEach(item => {
            item.querySelector('.accordion-item-header').addEventListener('click', () => {
                item.querySelector('.accordion-item-details').classList.toggle('active');
            });
        });
    }

    setDetails(carParks) {
        const accordionContainer = this.shadowRoot.querySelector('.accordion');
        carParks.forEach(carpark => {
            const accordionItem = document.createElement('div');
            accordionItem.classList.add('accordion-item');
            accordionItem.innerHTML = `
                <div class="accordion-item-header">
                    <strong>Car Park Number:</strong> ${carpark.car_park_no}
                </div>
                <div class="accordion-item-details">
                    <p><strong>Address:</strong> ${carpark.address}</p>
                    <p><strong>Type:</strong> ${carpark.car_park_type}</p>
                    <p><strong>Gantry Height:</strong> ${carpark.gantry_height}</p>
                </div>
            `;
            accordionContainer.appendChild(accordionItem);
        });
    }
}

class LoadingSpinner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .spinner {
                      display: inline-block;
                      width: 40px;
                      height: 40px;
                      border: 4px solid rgba(0, 0, 0, 0.1);
                      border-radius: 50%;
                      border-top-color: #333;
                      animation: spin 1s ease-in-out infinite;
                    }
                    
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>
            <div class="spinner"></div>
        `;
    }
}

// Register custom elements
customElements.define('filter-button', FilterButton);
customElements.define('car-park-item', CarParkItem);
customElements.define('loading-spinner', LoadingSpinner);



class AccordionItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .accordion-item {
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    margin-bottom: 10px;
                    background-color: #f9f9f9;
                    cursor: pointer;
                }
                .accordion-item p {
                    margin: 5px 0;
                    display: block; 
                    padding: 10px;
                }
            </style>
            <div class="accordion-item">
                <p><strong>Car Park Number:</strong> <span class="car-park-no"></span></p>
                <p><strong>Address:</strong> <span class="address"></span></p>
                <p><strong>Type:</strong> <span class="car-park-type"></span></p>
                <p><strong>Gantry Height:</strong> <span class="gantry-height"></span></p>
            </div>
        `;
    }

    connectedCallback() {
        this.addEventListener('click', () => {
            this.toggleDetails();
        });
    }

    toggleDetails() {
        const details = this.shadowRoot.querySelectorAll('.accordion-item p');
        details.forEach(detail => {
            detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
        });
    }

    setDetails(carPark) {
        this.shadowRoot.querySelector('.car-park-no').textContent = carPark.car_park_no;
        this.shadowRoot.querySelector('.address').textContent = carPark.address;
        this.shadowRoot.querySelector('.car-park-type').textContent = carPark.car_park_type;
        this.shadowRoot.querySelector('.gantry-height').textContent = carPark.gantry_height;
    }
}

// Register the AccordionItem component
customElements.define('accordion-item', AccordionItem);


// Function to handle fetching data with loading spinner
async function fetchDataWithSpinner(url) {
    const spinner = document.getElementById('spinner');
    try {
        // Show the loading spinner
        spinner.style.display = 'block';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        // Hide the loading spinner and display error message
        spinner.style.display = 'none';
        document.getElementById('errorMessage').textContent = 'Please enter a valid input';
        return null;
    } finally {
        // Hide loading spinner regardless of success or failure
        spinner.style.display = 'none';
    }
}



// Modify the displayCarParks function to create accordion items
function displayCarParks(carParks) {
    const carparkResults = document.getElementById('carparkResults');
    carparkResults.innerHTML = '';

    if (carParks.length === 0) {
        carparkResults.innerHTML = '<p>No car parks found.</p>';
        return;
    }

    carParks.forEach(carpark => {
        const accordionItem = document.createElement('accordion-item');
        accordionItem.setDetails(carpark);
        carparkResults.appendChild(accordionItem);
    });
}


// Add event listener for filter button click
document.getElementById('filterBtn').addEventListener('click', filterCarParks);






async function filterCarParks() {
    const filterType = document.getElementById('filterType').value;
    const userInput = document.getElementById('userInput').value;
    const filterByDistance = document.getElementById('filterByDistance').value;
    
    // Show loading spinner
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'block'; 

    try {
        let response;
        if (filterType === 'prefix' && filterByDistance === 'false') {
            response = await fetchDataWithSpinner(`http://localhost:8081/byPrefix/${userInput}`);
        } else if (filterType === 'prefix' && filterByDistance === 'true') {
            const userLat = parseFloat(document.getElementById('latitude').value);
            const userLon = parseFloat(document.getElementById('longitude').value);

            if (isNaN(userLat) || isNaN(userLon)) {
                alert('Please enter valid latitude and longitude.');
                return;
            }

            response = await fetchDataWithSpinner(`http://localhost:8081/byPrefixAndDistance/${userInput}/${userLat}/${userLon}`);
        } else if (filterType === 'height' && filterByDistance === 'false') {
            response = await fetchDataWithSpinner(`http://localhost:8081/byGantryHeight/${userInput}`);
        } else if (filterType === 'height' && filterByDistance === 'true') {
            const gantryHeight = parseFloat(userInput);
            if (isNaN(gantryHeight)) {
                alert('Please enter a valid gantry height.');
                return;
            }

            const userLat = parseFloat(document.getElementById('latitude').value);
            const userLon = parseFloat(document.getElementById('longitude').value);

            if (isNaN(userLat) || isNaN(userLon)) {
                alert('Please enter valid latitude and longitude.');
                return;
            }

            response = await fetchDataWithSpinner(`http://localhost:8081/byGantryHeightAndDistance/${gantryHeight}/${userLat}/${userLon}`);
        } else {
            alert('Please select a valid filter type.');
            return;
        }

        // Hide loading spinner after a delay
        setTimeout(() => {
            spinner.style.display = 'none';
            displayCarParks(response);
        }, 1500); 
    } catch (error) {
        console.error('Error:', error);
        alert('Please enter a valid input');
    } finally {
        // Ensure loading spinner is hidden
        spinner.style.display = 'none';
    }
}



// Function to toggle display of latitude and longitude inputs based on filter by distance selection
document.getElementById('filterByDistance').addEventListener('change', function() {
    const distanceInputs = document.getElementById('distanceInputs');
    if (this.value === 'true') {
        distanceInputs.style.display = 'block';
    } else {
        distanceInputs.style.display = 'none';
    }
});

// Function to toggle display of latitude and longitude inputs based on filter type selection
document.getElementById('filterType').addEventListener('change', function() {
    const distanceInputs = document.getElementById('distanceInputs');
    if (this.value === 'height' || this.value === 'prefix') {
        distanceInputs.style.display = 'block';
    } else {
        distanceInputs.style.display = 'none';
    }
});



