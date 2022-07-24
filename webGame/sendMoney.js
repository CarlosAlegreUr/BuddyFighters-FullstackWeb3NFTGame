import { ethers } from "./ethers-5.6.esm.min.js"

const deployButton = document.getElementById("deployContract")
deployButton.onclick = connect

async function connect() {
    try {
        if (typeof window.ethereum !== "undefined") {
            console.log("METAMASK DETECTED")
            await window.ethereum.request({ method: "eth_requestAccounts" })
            console.log("Connected")
            document.getElementById("deployContract").innerHTML = "CONNECTED!!! (from index.js)"
        } else {
            alert("METAMASK NOT DETECTED, PLEASE INSTALL IT")
        }
    } catch (error) {
        console.log(error)
    }
}

async function sendMoney() {}
