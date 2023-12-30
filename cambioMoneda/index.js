console.log('hola');
const api_url = 'https://mindicador.cl/api/';

async function getCoins(url) {
    try {
        const monedas = await fetch(url);
        const { dolar, ivp, euro, uf, utm } = await monedas.json();
        return [dolar, ivp, euro, uf, utm];
    } catch (error) {
        throw new Error(error);
    }
}

async function renderCoinOptions(url) {
    try {
        const selectContainer = document.getElementById('select_coin');
        const coins = await getCoins(url);

        coins.forEach((coinInfo) => {
            const option = document.createElement('option');
            option.value = coinInfo['codigo'];
            option.innerText = coinInfo['nombre'];
            selectContainer.appendChild(option);
        });
    } catch (error) {
        throw new Error(error);
    }
}

async function getCoinDetails(url, coinID) {
    try {
        if (coinID) {
            const coin = await fetch(`${url}${coinID}`);
            const { serie } = await coin.json();
            const [{ valor: coinValue, fecha: coinDate }] = serie;
            console.log(coinValue, coinDate);
            return { value: coinValue, fecha: coinDate };
        } else {
            alert('Selecciona una moneda');
            return null;
        }
    } catch (error) {
        throw new Error(error);
    }
}

async function getAndCreateDataToChart(url, coinID) {
    const coin = await fetch(`${url}${coinID}`);
    const { serie } = await coin.json();

    const labels = serie.map(({ fecha }) => fecha ? fecha : '');
    const data = serie.map(({ valor }) => valor);

    const datasets = [
        {
            label: 'precio ultimos dias',
            backgroundColor: 'red',  
            data,
        },
    ];

    return { labels, datasets };
}

async function renderGrafica() {
    const optionSelected = document.getElementById('select_coin').value;
    const coinDetails = await getCoinDetails(api_url, optionSelected);

    if (coinDetails === null) {
        return;
    }

    const amountInput = parseFloat(document.getElementById('amount-input').value);

    if (isNaN(amountInput) || amountInput <= 0) {
        alert('Ingrese un monto válido en pesos.');
        return;
    }

    const conversion = `$${(amountInput * coinDetails.value).toLocaleString('es-CL')}`;

    const today = new Date();
    const formattedDate = today.toLocaleDateString();

    document.getElementById('amount-converted').innerText = `Cantidad Convertida: ${conversion} CLP`;

    const data = await getAndCreateDataToChart(api_url, optionSelected);
    const config = {
        type: 'bar',
        data: data,
        options: {
            animations: {
                backgroundColor: {
                    type: 'color',
                    duration: 2000,
                    easing: 'linear',
                    from: '#000',
                    to: 'rgba(220,228,237,1)',
                    loop: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };

    const myChart = document.getElementById('chart');
    myChart.style.background = 'White';

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(myChart, config);
}

document.getElementById('search').addEventListener('click', async (event) => {
    renderGrafica();
});

renderCoinOptions(api_url);
