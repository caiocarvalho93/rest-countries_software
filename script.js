const API_URL = "https://restcountries.com/v3.1"
let allCountries = []
let currentTheme = 'dark-mode'; // myfav always dark , but different colors make me happy.. so

const homePage = document.getElementById("homePage");
const detailPage = document.getElementById('detailPage')
const countriesGrid = document.getElementById('countriesGrid');
const countryDetail = document.getElementById("countryDetail")
const searchInput = document.getElementById('searchInput');
const regionFilter = document.getElementById("regionFilter");
const themeToggle = document.getElementById('themeToggle')
const backButton = document.getElementById("backButton");
const pageLoader = document.getElementById("pageLoader")

document.addEventListener("DOMContentLoaded", () => {
    loadTheme()
    setupEventListeners();
    fetchAllCountries()
    setupReadmePopup();
});


function setupEventListeners() {

    searchInput.addEventListener("input", handleSearch);
    regionFilter.addEventListener('change', handleFilter)
    themeToggle.addEventListener("click", toggleTheme);
    backButton.addEventListener('click', showHomePage)

}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light-mode"
    currentTheme = savedTheme
    document.body.className = savedTheme;
    updateThemeButton()
}

function toggleTheme() {

    currentTheme = currentTheme === "light-mode" ? "dark-mode" : "light-mode";
    document.body.className = currentTheme
    localStorage.setItem("theme", currentTheme);
    updateThemeButton()
}

function updateThemeButton() {
    themeToggle.textContent = currentTheme === "dark-mode" ? "☀️ Cai Light Mode" : "👻 Cai Dark Mode"
}

async function fetchAllCountries() {
    showLoading()
    try {
        const response = await fetch(`${API_URL}/all?fields=name,flags,population,region,capital,cca3`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const countries = await response.json()
        allCountries = countries
        displayCountries(allCountries)
    } catch (e) {
        showError("Failed to load countries. Please refresh the page.");
        console.error(e)
    }
}


async function fetchCountryDetails(code) {
    try {
        const response = await fetch(`${API_URL}/alpha/${code}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const countryData = await response.json()
        return countryData[0]
    } catch (e) {
        console.error(e)
        return null
    }
}

function clearChildren(element) {
    while (element.firstChild) element.removeChild(element.firstChild)
}

function displayCountries(countries) {

    clearChildren(countriesGrid)
    if (!countries || countries.length === 0) {
        countriesGrid.textContent = "No countries found"
        return
    }

    countries.forEach(country => {

        const card = document.createElement("div")
        card.className = "country-card";
        card.addEventListener("click", () => showCountryDetail(country.cca3))

        const flag = document.createElement("img");
        flag.src = country.flags.png
        flag.alt = country.flags.alt || `Flag of ${country.name.common}`
        flag.onerror = () => flag.src = "https://via.placeholder.com/320x160/cccccc/666666?text=Flag+Not+Found";
        card.appendChild(flag)

        const info = document.createElement("div")
        info.className = "country-info"

        const name = document.createElement("h3");
        name.textContent = country.name.common
        info.appendChild(name)

        const population = document.createElement("p");
        population.innerHTML = `<strong>Population:</strong> ${country.population.toLocaleString()}`
        info.appendChild(population)

        const region = document.createElement("p")
        region.innerHTML = `<strong>Region:</strong> ${country.region}`;
        info.appendChild(region)

        const capital = document.createElement("p");
        capital.innerHTML = `<strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}`
        info.appendChild(capital)

        card.appendChild(info)
        countriesGrid.appendChild(card);
    })
}

async function displayCountryDetail(country) {
    clearChildren(countryDetail)
    if (!country) {
        countryDetail.textContent = "Country details not found"
        return
    }

    // projhetcs data prep
    const currencies = country.currencies ? Object.values(country.currencies).map(c => c.name).join(", ") : "N/A"
    const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A";
    const nativeName = country.name.nativeName ? Object.values(country.name.nativeName)[0].common : "N/A"

    // gotta create my divs
    const header = document.createElement("div")
    header.className = "country-detail-header";

    const flag = document.createElement("img")
    flag.className = "country-detail-flag"
    flag.src = country.flags.png;
    flag.alt = country.flags.alt || `Flag of ${country.name.common}`
    flag.onerror = () => flag.src = "https://via.placeholder.com/300x200/cccccc/666666?text=Flag+Not+Found"
    header.appendChild(flag)

    const content = document.createElement("div")
    content.className = "country-detail-content"

    const title = document.createElement("h2");
    title.textContent = country.name.common
    content.appendChild(title);

    const detailGrid = document.createElement("div")
    detailGrid.className = "detail-grid"

    const basicSection = document.createElement("div")
    basicSection.className = "detail-section";
    basicSection.innerHTML = `

    
        <h3>Basic Information</h3>
        <p><strong>Native Name:</strong> ${nativeName}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Sub Region:</strong> ${country.subregion || "N/A"}</p>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
    `
    detailGrid.appendChild(basicSection)

    const additionalSection = document.createElement("div");
    additionalSection.className = "detail-section"
    additionalSection.innerHTML = `
        
        <h3>Additional Details</h3>
        <p><strong>Top Level Domain:</strong> ${country.tld ? country.tld.join(", ") : "N/A"}</p>
        <p><strong>Currencies:</strong> ${currencies}</p>
       
        <p><strong>Languages:</strong> ${languages}</p>
        
    `
    detailGrid.appendChild(additionalSection)

    content.appendChild(detailGrid)

    if (country.borders && country.borders.length > 0) {
        const bordersContainer = document.createElement("div")
        bordersContainer.className = "border-countries";

        const bordersTitle = document.createElement("h3")
        bordersTitle.textContent = "Border Countries"
        bordersContainer.appendChild(bordersTitle);

        const borderTags = document.createElement("div");
        borderTags.className = "border-tags"

        country.borders.forEach(borderCode => {
            const tag = document.createElement("span")
            tag.className = "border-tag";
            tag.textContent = borderCode
            tag.addEventListener("click", () => showCountryDetail(borderCode))
            borderTags.appendChild(tag);
        })

        bordersContainer.appendChild(borderTags)
        content.appendChild(bordersContainer);
    }

    header.appendChild(content)
    countryDetail.appendChild(header)
}

function handleSearch() {
    const term = searchInput.value.toLowerCase().trim()
    filterCountries(term, regionFilter.value)
}

function handleFilter() {
    const term = searchInput.value.toLowerCase().trim();
    filterCountries(term, regionFilter.value)
}

function filterCountries(searchTerm, region) {
    let filtered = allCountries
    if (searchTerm) {
        filtered = filtered.filter(c => c.name.common.toLowerCase().includes(searchTerm))
    }
    if (region) {
        filtered = filtered.filter(c => c.region === region);
    }
    displayCountries(filtered)
}

function showHomePage() {
    showLoader()
    setTimeout(() => {
        homePage.classList.add("active")
        detailPage.classList.remove("active");
        hideLoader()
    }, 400)
}

async function showCountryDetail(code) {
    showLoader()
    homePage.classList.remove("active");
    detailPage.classList.add("active")
    clearChildren(countryDetail)
    countryDetail.textContent = "Loading country details..."

    const basicCountry = allCountries.find(c => c.cca3 === code)
    if (!basicCountry) {
        countryDetail.textContent = "Country not found";
        hideLoader()
        return
    }
    const fullCountry = await fetchCountryDetails(code)
    await displayCountryDetail(fullCountry || basicCountry);
    hideLoader()
}

function showLoading() {
    countriesGrid.textContent = "Loading countries..."
}

function showError(msg) {
    countriesGrid.textContent = msg
}

function showLoader() { pageLoader.classList.add("active"); }
function hideLoader() { pageLoader.classList.remove("active"); }

// README  PART
function setupReadmePopup() {

    const readmePopup = document.getElementById("readmePopup");
    const closeBtn = document.getElementById("closeReadme");
    const hasVisited = localStorage.getItem("visitedCountryApp");
    
    if (!hasVisited) {

        readmePopup.style.display = "flex";
    }
    closeBtn.addEventListener("click", () => {
        readmePopup.style.opacity = "0";

        setTimeout(() => {
            readmePopup.style.display = "none";
            localStorage.setItem("visitedCountryApp", "true");
        }, 300);    
    });
}
