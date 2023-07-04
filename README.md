<h1 align="center">
  <br>
  <a><img src="https://image.shutterstock.com/image-photo/pattaya-thailand-2-sep-2016-600w-477402835.jpg" width="200"></a>
  <br>
  <strong>BuddyFighters (IN DEVELOPMENT)</strong>
  <br>
</h1>
  <a src="https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/tree/main "> <h3 align="center"><strong> PLAY IN WEB! (not deployed yet) </strong><H3> </a>
<hr>

<h4 align="center"><strong>A fighting game on the browser using NFT technology that can be played in EVM compatible blockchains.

(completely decentralized version incoming...)</strong></h4>

<hr/>

# Index

- **Purpose of this Repository 🤔**

- **About the App ℹ️**
  - Potential Misuse of Power 💢
  - **A Trustless Fully Decentralized Scenario 👼**
- **App Demonstration Video: 📹** (TODO)
- **Packages & Technologies Utilized 🧰**
- **How the System Functions ⚙️**
- **Project Structure 📁**
- **Capabilities Of Deployed App 🏃**
- **Instructions for Local Usage ℹ️🏠**
- **Special Thanks 😄**
- **TODO 🚧**
- **License 📎**

<hr/>

# **Purpose of this Repository 🤔**

This repository hosts the code required to run a robust full-stack web application. Besides interacting with traditional full-stack web systems, it also interfaces with EVM-compatible blockchains and decentralized networks like IPFS for certain services.

<hr/>

# **About the App ℹ️**

Essentially, this application is a fighting game where players can battle against each other using NFTs and wager their cryptocurrencies on these fights. It includes a "change stats" feature, allowing you to adjust your NFT's stats in a fully trustless, decentralized manner.

The fighting and betting system isn't completely trustless as it requires a trusted backend to execute off-chain computations when battles occur. However, it's designed in a way that makes any backend misbehavior easy to detect, enhancing the overall trustworthiness of the app's betting system.

## **Potential Misuse of Power 💢**

One point of concern is the declaration of the winner. The backend could potentially declare any winner it prefers, regardless of the actual battle outcome. As the system stands, it's impossible to fully verify via computations alone if the backend is being dishonest. A more resource-intensive system on-chain that resolves this issue could be implemented, as explained below.

So backend can potentially steal your current bet in an active fight if desired.

The second point of concern is in `startFight()` function, specifically in the `_bets` variable. You have to trust
the backend will give input permissions with the correct bets and not with higher ones. Backend can potentially
cooperate with a party player to give permissions saying your bet was higher than the one you deposited which will
result in you losing your tickets.

## **A Trustless Fully Decentralized Scenario 👼**

Basically the decentralized scenario consists of contracts that implement:

- **Decentralized matchmaking**.
- **Decentralized activation of events on blockchain**.
- **Decentralized fight state management**.

All this is already possible, I've just haven't programmed it yet.
Disadvantage is it results in a more expensive game to play due to the need for more transactions and on-chain
computations. The following solution just focuses on making
it truly decentralized and as cheap as possible, but prioritizing always fair play and trustless decentralized gameplay.

This is how it would be done though:

### **Decentralized Matchmaking**

You could even decentralize this app more without even requiring a backend to execute
the matchmaking by doing the following:

Using `InputControl` contract you can allow player to give each other permissions to call
`startFight()` with a previously agreed value so now no bets would be faked.

If you mix this with the fight's states management on-chain described above there would
not even be a need for a trusted backend or a backend at all.

### **Decentralized Activation of Events on Blockchain**

This feature would be needed in order for fights, turns, or matchmaking not to potentially last forever.

This feature idea has already been explored and implemented by Chainlink team with
their [Time Based Automation](https://docs.chain.link/chainlink-automation/job-scheduler).

### **Decentralized Fight State Management**

To facilitate trustless fights, we'd need to introduce additional variables and functions to the `FightsManager` contract.

These would include:

- Mapping of the player's address to the last move executed. This variable should only be alterable by the same player, with moves potentially represented by integers.
- Mapping of the `fightId` to the last fight state. This would be a unique hashed representation of the fight state after each turn.

Once the next move is updated, the next fight's state should be predictable by both clients. For the clients to agree on the next state, the game logic must be open-source.

There must also be a function that validates next fight states, if different fight states are calculated by clients this function could be called to figure out the right one and punish just the players who actually didn't behave correctly.

> **Note**: For game mechanics with **luck based moves**, **VRF Chainlink** contracts should be used to determine the **random luck based result**. So users can validate the next fight state, even if the
> process is deterministic, now they can **use a verified
> random value for the deterministically computed next state.**

<hr/>

# **App Demonstration Video: 📹*** (TODO)

<hr/>

# **Packages & Technologies Utilized 🧰**

The application uses a range of packages to create a robust and efficient system. The front-end and back-end services rely on different sets of packages, tailored to suit their specific needs.

For the complete list of dependencies, please check the `package.json` file in the respective front-end and back-end directories.

**Back-end dependencies** include:

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
- express-winston: Server-side logging.

**Front-end dependencies** include:

- @web3uikit/core: UI components for DApps.
- ethers: Ethereum blockchain and smart contracts JavaScript API.
- moralis: For fast blockchain development.
- react: For the UI.

<hr/>

# **How the System Functions ⚙️**

The **front end** handles API calls to the **backend** and also contains blockchain interaction code executed through a **MetaMask** provider.

The **backend** comprises all the services, controllers, and route structures necessary for the **request-response communication** cycle. Additionally, it uses **Server-Side Events (SSE)** to manage matchmaking and fight mechanics services. Moreover, it interacts with the blockchain via **Alchemy** as a provider.

And don't forget to mention the front end and backend are designed to be hosted on different servers, therefore utilizing **CORS**.

# **Project Structure 📁**

Here is the **overall structure** of the project. It's divided into **two main parts**: `game` (back-end) and `website-game` (front-end).

Each directory is **further structured** to organize files based on their functionality. Not all files are listed here, only the **most relevant ones** for a high-level overview. For more detailed information, please navigate to the respective directories.

This structure allows for **modular development**, **easy maintainability**, and **scalability** of the project.

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

# **Capabilities of the Deployed App 🏃**

As a personal portfolio project, the public website and backend are limited to supporting only **4 authenticated users** playing or using backend services simultaneously. This restriction allows me to host the project for free. (:D)

---

# **Instructions for Local Usage ℹ️🏠**

To run the application locally, follow these steps:

1. Download the code.
2. Start a Hardhat node.
3. Mint some NFTs using the provided minting script.
4. Launch the website on two different browsers or in sessions that don't share cookies.
5. Connect MetaMask to the local Hardhat network using the first two default addresses, one for each browser.
6. Run the server file.
7. Start the MongoDB database.
8. Make sure you have all the `.env` API keys for the services used by the app.

---

## **Special thanks 😄**

Thanks to <a href="https://twitter.com/aonsager" target="_blank"> @aonsager </a> for <a href="https://twitter.com/charlescheerfu1/status/1546925876494929927" target="_blank"> allowing </a> me to use his images as long as I don't create a commercial product out of them.

Creator of => <a href="https://pokemon.alexonsager.net/" target="_blank"> https://pokemon.alexonsager.net/ </a>

Source of the pokemon fusions images used in this project. <br>
<img src="./readme-images/p0.png" width="75">
<img src="./readme-images/p1.png" width="75">
<img src="./readme-images/p2.png" width="75">
<img src="./readme-images/p3.png" width="75">
<img src="./readme-images/p4.png" width="75">
<img src="./readme-images/p5.png" width="75">

---

# **TODO 🚧**

1. Apply static analysis, fuzz testing and symbolic analysis in smart contracts.
2. Try to improve smart contract tests.
3. Finish and test frontend, API and backend services.
4. Improve READMEs: intructions for local usage.
5. Try to improve tests' readability.
6. Create the completely decentralized trustless version of BuddyFighters!

---

## **License 📎**

MIT

---

> GitHub [@CarlosAlegreUr](https://github.com/CarlosAlegreUr)
