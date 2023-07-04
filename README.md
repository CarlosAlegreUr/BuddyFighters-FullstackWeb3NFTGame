<h1 align="center">
  <br>
  <a><img src="https://image.shutterstock.com/image-photo/pattaya-thailand-2-sep-2016-600w-477402835.jpg" width="200"></a>
  <br>
  BuddyFighters (IN DEVELOPMENT)
  <br>
</h1>
  <a src="https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/tree/main "> <h3 align="center"> PLAY IN WEB! (not deployed yet) <H3> </a>
<hr>

<h4 align="center">A fighting game on the browser using NFT techonlogy that can be played in EVM compatible blockchains.</h4>

<hr/>

# Index

- Purpose of this Repository
- About the App
  - Potential Misuse of Power
  - Solution for a Trustless Scenario
  - Decentralized Matchmaking
- App Demonstration Video
- Packages and Technologies Utilized
- How the System Functions
- Project Structure
- Capabilities Of Deployed App
- Instructions for Local Usage
- Special Thanks
- TODO
- License

<hr/>

# Purpose of this Repository

This repository hosts the code required to run a robust full-stack web application. Besides interacting with traditional full-stack web systems, it also interfaces with EVM-compatible blockchains and decentralized networks like IPFS for certain services.

<hr/>

# About the App

Essentially, this application is a fighting game where players can battle against each other using NFTs and wager their cryptocurrencies on these fights. It includes a "change stats" feature, allowing you to adjust your NFT's stats in a fully trustless, decentralized manner.

The fighting and betting system isn't completely trustless as it requires a trusted backend to execute off-chain computations when battles occur. However, it's designed in a way that makes any backend misbehavior easy to detect, enhancing the overall trustworthiness of the app's betting system.

## Potential Misuses of Power

One point of concern is the declaration of the winner. The backend could potentially declare any winner it prefers, regardless of the actual battle outcome. As the system stands, it's impossible to fully verify veia computations alone if the backend is being dishonest. A more resource-intensive system that resolves this issue could be implemented, as explained below.

# TODO:

(fake calculations durint turns explain) (give someone permission to start fight with you
without telling you => abuse of tickets)

## Analysis of Trustless Scenarios

To facilitate trustless fights, we'd need to introduce additional variables and functions to the FightsManager.sol contract. These would include:

A mapping of the player's address to the last move executed. This variable should only be alterable by the same player, with moves potentially represented by integers.

A mapping of the fightId to the last fight state. This would be a unique hashed representation of the fight state after each turn. This state should only be updated by the backend to prevent any party with a monetary interest from manipulating it to their advantage. Ideally, the client-selected moves should be sufficient to verify that applying the open-source game logic to a given fight state would unequivocally lead to a subsequent fight state. Note: For game mechanics with moves that have a certain chance to trigger a special effect, the backend should employ VRF Chainlink contracts to determine that chance. Any user wishing to validate that the fight state is updated correctly should use the VRF-generated value to compute the next state.

Obviously, this would necessitate a transaction from both clients for every turn in the game, plus one or more additional transactions for the backend to generate random numbers, potentially increasing the cost of play. This cost could be mitigated by deploying the game on cheaper EVM-compatible blockchains, such as POLYGON.

To calculate the costs you should take into account updating a fight state mapping value costs X gas, and updating an integer mapping value costs Y gas. With a current gas price of approximately Z GWei and the native POLYGON coin priced at $W, the minimum business cost for each round, excluding any random number generation mechanics, would be: X * Z*0.000000001 \* W

The corresponding cost for the client would be: Y * Z*0.000000001 \* W

Notice first time the map is asigned a value transaction will be more expensive due to new storage usage in the contract, but in all the other cases vlaues are aproxaimately calculated like this. Obviously using gas simulations before taking a decision must be done.

## Decentralized Matchmaking (TO FINISH WRITING CLEARLY)

You could even decentralize this app more without even requiring a backend to execute
the matchmaking doing the following:

Using input control allow addresses to allow other player's addresses to call
the startFight() function with a specific input.

But in order for other player to give permission to another to start a fight with him
you have to add an extra variable:
First addres => Player giving permision
Second address => Player that will recieve permission
Bool => Has permission or not?
mapping(address => mapping(address => bool)) s_playerToHasPermission

So one player would grant permission, only the first address can modify
the values that mapping map from it's address.

So then in InputControl before calling allowInputsFor() there would be a filter
on one of the addresses inputs must be equal to the caller address...

### IF BOTH MECHANICS IMPLEMENTED THEN IT WOULD BECOME A REAL FULLY DECENTRALIZED TRUSTLESS BETTING ON POKEMON STYLE BATTLES APP

<hr/>

# App Demonstration Video (TODO)

<hr/>

# Packages and Technologies Utilized

The application uses a range of packages to create a robust and efficient system. The front-end and back-end services rely on different sets of packages, tailored to suit their specific needs.

For the complete list of dependencies, please check the package.json file in the respective front-end and back-end directories.

Back-end dependencies include:

- ethers: Ethereum blockchain and smart contracts JavaScript API.
- @chainlink/contracts: VRF (Verifiable Random Function) Chainlink.
- @openzeppelin/contracts: Secure open source smart contracts.
- agenda: For lightweight job scheduling.
- express: Web server framework.
- mongoose: For MongoDB object modeling.
- jsonwebtoken: For JSON Web Token sign and verify.
- express-sse: Server-side events management in express framework.
- cors: For enabling CORS in Express.
- dotenv: Management of environment variables.
- express-winston: Server side logging.

Front-end dependencies include:

- @web3uikit/core: UI components for DApps.
- ethers: Ethereum blockchain and smart contracts JavaScript API.
- moralis: For fast blockchain development.
- react: For the UI.

<hr/>

# How the System Functions

The front end handles API calls to the backend and also contains blockchain interaction code executed through a MetaMask provider.

The backend comprises all the services, controllers, and route structures necessary for the traditional HTTP request-response cycle. Additionally, it uses Server-Side Events (SSE) to manage matchmaking and fight mechanics services. Moreover, it interacts with the blockchain via Alchemy as a provider.

And don't forget to mention front end and backend are designed to be hosted in different servers therefore using CORS.

<hr/>

# Project Structure

Here is the overall structure of the project, it's divided into two main parts: game (back-end) and website-game (front-end).

Each directory is further structured to organize files based on their functionality. Not all files are listed here, only the most relevant ones for a high-level overview. For more detailed information, please navigate to the respective directories.

This structure allows for modular development, easy maintainability, and scalability of the project.

```
.
├── game (Contains the server-side logic, blockchain scripts, contracts and tests)
│   ├── README.md
│   ├── src
│   │   ├── blockchainScripts (Scripts directly interacting with the blockchain)
│   │   ├── contracts (Smart Contracts written in Solidity)
│   │   ├── controllers (Controllers to manage route handling)
│   │   ├── database (Mongoose models and DB connection settings)
│   │   ├── logs (Different log files and the logger script)
│   │   ├── middleware (Middleware for Express.js, JWT AUTH and SSE management)
│   │   ├── routes (Routes for Express.js)
│   │   ├── serverConfig (Server configuration file)
│   │   ├── services (Services to handle business logic)
│   │   ├── tasks (Background tasks setup)
│   │   ├── tests (Unit and integration tests for the blockchain scripts and services)
│   │   └── utils (Utility scripts used across the project)
│   ├── hardhat.config.js
│   ├── helper-hardhat-config.js
│   ├── nodemon.json
│   ├── package.json
│   └── yarn.lock
├── LICENSE
├── package.json
├── printChildrenDirectories.sh
├── readme-images (images used in the readmes)
├── README.md
├── TODO.md
├── website-game (Contains the client-side logic, UI components, and styles)
│   ├── components (React components for UI)
│   ├── constants (JSON and index files with constant values)
│   ├── next.config.js
│   ├── package.json
│   ├── pages (React pages)
│   ├── public (Static files served by Next.js)
│   ├── README.md
│   ├── styles (CSS and SCSS style files)
│   ├── utils (Utility scripts used across the project)
│   └── yarn.lock
└── yarn.lock
```

<hr/>

# Capabilities of the Deployed App

As a personal portfolio project, the public website and backend are limited to supporting only 4 authenticated users playing or using backend services simultaneously. This restriction allows me to host the project for free. (:D)

<hr/>

# Instructions for Local Usage

To run the application locally, follow these steps:

1.Download the code.

2.Start a Hardhat node.

3.Mint some NFTs using the provided minting script.

4.Launch the website on two different browsers or in sessions that don't share cookies.

5.Connect MetaMask to the local Hardhat network using the first two default addresses, one for each browser.

6.Run the server file.

7.Start the MongoDB database.

8.Make sure you have all the .env API keys for the services used by the app.

<hr/>

## Special thanks

Thanks <a href="https://twitter.com/aonsager" target="_blank"> @aonsager </a> for <a href="https://twitter.com/charlescheerfu1/status/1546925876494929927" target="_blank"> allowing </a> me to use his images as long as I don't create a commercial product out of them.

Creator of => <a href="https://pokemon.alexonsager.net/" target="_blank"> https://pokemon.alexonsager.net/ </a>

Source of the pokemon fusions images used in this project.
<br>
<img src="./readme-images/p0.png" width="75">
<img src="./readme-images/p1.png" width="75">
<img src="./readme-images/p2.png" width="75">
<img src="./readme-images/p3.png" width="75">
<img src="./readme-images/p4.png" width="75">
<img src="./readme-images/p5.png" width="75">

<hr/>

# TODO:

1. Apply static analysis, fuzz testing and symbolic analysis in smart contracts.

2. Try to improve smart contract tests.

3. Finish and test frontend, API and backend services.

4. Try to improve tests' readability.

5. Create the completely decentralized trustless version of BuddyFighters!

<hr/>

## License

MIT

---

> GitHub [@CarlosAlegreUr](https://github.com/CarlosAlegreUr)
