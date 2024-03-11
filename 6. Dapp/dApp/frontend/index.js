import { ethers } from './ethers.min.js';
import { abi, contractAddress } from './constants/index.js';

const connectButton = document.getElementById('connectButton');
const theNumber = document.getElementById('theNumber');
const inputAmount = document.getElementById('inputAmount');
const inputAmount2 = document.getElementById('inputAmount2');
const sendAmount = document.getElementById('sendAmount');
const getAmount = document.getElementById('getAmount');
const getNumber = document.getElementById('getNumber');

let connectedAccount;

connectButton.addEventListener('click', async function() {
    if(typeof window.ethereum !== 'undefined') {
        const resultAccount = await window.ethereum.request({ method: "eth_requestAccounts" });
        connectedAccount = ethers.getAddress(resultAccount[0]);
        connectButton.innerHTML = "Connected with " + connectedAccount.substring(0, 4) + "..." + connectedAccount.substring(connectedAccount.length - 4);
        await getBalanceOfUser();
    }
    else {
        connectButton.innerHTML = "Please install Metamask";
    }
})


sendAmount.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            let userInputAmount = inputAmount.value;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            let transaction = await contract.sendEthers({ value: userInputAmount });
            await transaction.wait();
        }
        catch(e) {
            console.log(e);
        }
    }
})

async function getBalanceOfUser() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    let balance = await contract.getBalanceOfUser(connectedAccount);
    theNumber.innerHTML = ethers.formatEther(balance) + " ETH";
}

getNumber.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, abi, provider);
            let balance = await contract.getBalanceOfUser(connectedAccount);
            theNumber.innerHTML = ethers.formatEther(balance) + " ETH";
        }
        catch(e) {
            console.log(e);
        }
    }
})

