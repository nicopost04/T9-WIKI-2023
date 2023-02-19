//interaction between html and js
const submitButton = document.querySelector('#submit');
const input = document.querySelector('#input');
const resultsContainer = document.querySelector('#results');
let trueOrFalse;
const verdict = document.querySelector('#verdict');
console.log(input.value);


//create link base
const endpoint = 'https://en.wikipedia.org/w/api.php?';

//params for query
const params = {
    origin: '*',
    format: 'json',
    action: 'query',
    prop: 'extracts',
    exchars: 250,
    exintro: true,
    explaintext: true,
    generator: 'search',
    gsrlimit: 21,
    gsrwhat: 'text',
};

const getData = async () => {
    const userInput = input.value;
    if (isInputEmpty(userInput)) return;

    params.gsrsearch = userInput;
    console.log(params.gsrsearch);

    try {
        const { data } = await axios.get(endpoint, { params });
        console.log(data.query);

        if (data.error) throw new Error(data.error.info);
        gatherData(data.query.pages);
    } catch (error) {
        console.log(error);
    } finally {
        console.log("success");
        enableUi();
    }
};

const enableUi = () => {
    input.disabled = false;
    submitButton.disabled = false;
};

const isInputEmpty = input => {
    if (!input || input === '') return true;
    return false;
};

const showResults = results => {
    console.log("showing results...");
    //t/f
    verdict.innerHTML += `
        <h1>${trueOrFalse}</h1>
        <h3>Scroll for relevant articles</h3>
    `;

    results.forEach(result => {

        //output articles
        resultsContainer.innerHTML += `
        <div class="results__item">
            <a href=${result.url} target="_blank" class="card animated bounceInUp">
                <h2 class="results__item__title">${result.title}</h2>
                <p class="results__item__intro">${result.intro}</p>
            </a>
        </div>
    `;
    });
};

const determineVerdict = results => {
    //outer loop for array of pages
    for (let o = 0; o < results.length; o++) {
        console.log("checking article title: " + results[o].title);
        console.log("input=" + input.value);
        
        if (typeof results[o].intro === 'string') {
            console.log("index: " + results[o].intro.search(input.value));
            if (results[o].intro.search(input.value) > -1) return true;
        }

        o++;
    }
    return false;
}

const gatherData = pages => {
    const results = Object.values(pages).map(page => ({
        pageId: page.pageid,
        title: page.title,
        intro: page.extract,
        url: ("https://en.wikipedia.org/?curid=" + page.pageid),
    }));

    //call determineVerdict
    if(determineVerdict(results)) {
        trueOrFalse = "True";
    } else trueOrFalse = "Inconclusive";
    
    
    showResults(results);
};

const clearPreviousResults = () => {
    resultsContainer.innerHTML = '';
    verdict.innerHTML = '';
};

const handleKeyEvent = e => {
    if (e.key === 'Enter') {
        clearPreviousResults();
        getData();
    }
};

const registerEventHandlers = () => {
    input.addEventListener('keydown', handleKeyEvent);
    submitButton.addEventListener('click', getData);
};

registerEventHandlers();
