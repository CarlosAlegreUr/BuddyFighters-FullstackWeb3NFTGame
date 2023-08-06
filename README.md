# What is this repo? 🤔

Please read [**Purpose of this Repository 🤔**](#purpose-of-this-repository-🤔) (1 min read)

<h1 align="center">
  <br>
  <a><img src="./readme-images/pokeball.png" width="200"></a>
  <br>
  <strong>BuddyFighters (IN DEVELOPMENT)</strong>
  <br>
</h1>
  <a src="https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/tree/main "> <h3 align="center"><strong> PLAY IN WEB! (not deployed yet) </strong><H3> </a>
<hr>

<h4 align="center"><strong>A fighting game on the browser using NFT technology that can be played in EVM compatible blockchains.

(completely decentralized version might come...)</strong></h4>

<hr/>

# Index

- [**Purpose of this Repository 🤔**](#purpose-of-this-repository)
- [**App So Far Demo Video: 📹**](#app-so-far-demo-video-📹)
- [**About the App ℹ️**](#about-the-app-ℹ️)
  - [Potential Misuse of Power 💢](#potential-misuse-of-power-💢)
  - [**A Trustless Fully Decentralized Scenario 👼**](#a-trustless-fully-decentralized-scenario-👼)
- [**Self-Audit state 💥**](#self-audit-state-💥)
- [**Packages & Technologies Utilized 🧰**](#packages--technologies-utilized-🧰)
- [**How the System Functions ⚙️**](#how-the-system-functions-⚙️)
- [**Project Structure 📁**](#project-structure-📁)
- [**Capabilities Of Deployed App 🏃**](#capabilities-of-deployed-app-🏃)
- [**Instructions for Local Usage ℹ️🏠**](#instructions-for-local-usage-ℹ️🏠)
- [**Special Thanks 😄**](#special-thanks-😄)
- [**TODO 🚧**](#todo-🚧)
- [**License 📎**](#license-📎)

<hr/>

# **Purpose of this Repository 🤔**

Learn and **gain experience in developing a robust full-stack web application** that combines traditional **`client-server-database`** mechanics and cutting-edge interactions with **`EVM-compatible blockchains and`** decentralized networks like **`IPFS`**.

## **What I Learned 📘:**

- **General Insights 🔍**

  - _**`Systems Design`**_ : Divide and Conquer, Separation of Responsibilities, Don't Repeat Yourself...
  - _**`Client-Server communication`**_ : request-response, SSE...
  - **`Database state management`** : CRUD operations, clean-up functions...
  - **`Blockchain and IPFS interaction`** : with server and client.
  - _**`Smart Contracts' System Design`**_

- **Backend Development 💻:**

  - Client-Server **`API development`**: routing, controllers, and services.
  - **`User auth methods`** in Web2 and Web3 : signature-based-auth and token auth.
  - **`Error handling, logging and job scheduling`**.
  - **`MongoDB`**.
  - **`System testing`** using frameworks like Mocha, Chai, and Supertest.

- **Frontend Development 🎨:**
  - **`Next.js`** for building **`React`** apps.
  - **`UI/UX design`** for web3.

At this stage, I am content to leave the project in its current state. I've achieved significant learning through practical experience and don't foresee additional learning benefits from further development. However, in the future, I might develop this project for fun. 😄

<hr/>

# **About the App ℹ️**

Essentially, this application is a fighting game where players can battle against each other using NFTs and bet their cryptocurrencies on these fights. It includes a "change stats" feature, allowing you to adjust your NFT's stats in a fully trustless, decentralized manner.

#### (TODO)

# **App So Far Demo Video: 📹**

The fighting and betting system isn't completely trustless, as it requires a trusted backend to execute off-chain computations when battles occur. However, it's designed in a way that makes any backend misbehavior easy to detect, enhancing the overall trustworthiness of the app's betting system.

## **Potential Misuse of Power 💢**

One point of concern is the declaration of the winner. The backend could potentially declare any winner it prefers, regardless of the actual battle outcome. As the system stands, it's impossible to fully verify via computations alone if the backend is being dishonest. A more resource-intensive system on-chain that resolves this issue could be implemented, as explained below.

So the backend can potentially steal your current bet in an active fight if desired.

The second point of concern is in the `startFight()` function, specifically in the `_bets` variable. You have to trust that the backend will give input permissions with the correct bets and not with higher ones. The backend can potentially cooperate with a party player to give permissions, saying your bet was higher than the one you deposited, which will result in you losing your tickets.

## **A Trustless Fully Decentralized Scenario 👼**

Basically, the decentralized scenario consists of contracts that implement:

- **Decentralized matchmaking**.
- **Decentralized activation of events on the blockchain**.
- **Decentralized fight state management**.

All this is already possible; I just haven't programmed it yet. The disadvantage is that it results in a more expensive game to play due to the need for more transactions and on-chain computations. The following solution just focuses on making it truly decentralized and as cheap as possible, but always prioritizing fair play and trustless decentralized gameplay.

This is how it would be done though:

### **Decentralized Matchmaking**

You could even decentralize this app more without even requiring a backend to execute the matchmaking by doing the following:

Using the `InputControl` contract, you can allow players to give each other permissions to call `startFight()` with a previously agreed value, so now no bets would be faked.

If you mix this with the fight's states management on-chain described above, there would not even be a need for a trusted backend or a backend at all.

### **Decentralized Activation of Events on Blockchain**

This feature would be needed in order for fights, turns, or matchmaking not to potentially last forever.

This feature idea has already been explored and implemented by the Chainlink team with their [Time Based Automation](https://docs.chain.link/chainlink-automation/job-scheduler).

### **Decentralized Fight State Management**

To facilitate trustless fights, we'd need to introduce additional variables and functions to the `FightsManager` contract.

These would include:

- Mapping of the player's address to the last move executed. This variable should only be alterable by the same player, with moves potentially represented by integers.
- Mapping of the `fightId` to the last fight state. This would be a unique hashed representation of the fight state after each turn.

Once the next move is updated, the next fight's state should be predictable by both clients. For the clients to agree on the next state, the game logic must be open-source.

There must also be a function that validates the next fight states. If different fight states are calculated by clients, this function could be called to figure out the right one and punish only the players who actually didn't behave correctly.

> **📘 Note ℹ️**: For game mechanics with **luck-based moves**, **VRF Chainlink** contracts should be used to determine the **random luck-based result**. So users can validate the next fight state, even if the process is deterministic. Now they can **use a verified random value for the deterministically computed next state.**

<hr/>

# **Self-Audit state 💥**

Hardhat localhost network 🟡 :

- Manual testing 🟢
- High Manual Tests' Coverage 🟢
- Slither syntax analysis 🟢
- Contracts Fuzz & Invariant testing ⛔🕵️

Any testnet or mainnet 🔴 ⛔⛔⛔⛔

<hr/>

# **Packages & Technologies Utilized 🧰**

For the complete list of dependencies, please check the `package.json` file in the respective front-end and back-end directories.

<details> <summary> Back-end dependencies 💻 </summary>

- `ethers`: Ethereum blockchain and smart contracts JavaScript API.
- `@chainlink/contracts`: VRF (Verifiable Random Function) Chainlink.
- `@openzeppelin/contracts`: Secure open source smart contracts.
- `agenda`: For lightweight job scheduling.
- `express`: Web server framework.
- `mongoose`: For MongoDB object modeling.
- `jsonwebtoken`: For JSON Web Token sign and verify.
- `express-sse`: Server-side events management in express framework.
- `cors`: For enabling CORS in Express.
- `dotenv`: Management of environment variables.
- `express-winston`: Server-side logging.

</details>

<details> <summary> Front-end dependencies 🎨 </summary>

- `@web3uikit/core`: UI components for DApps.
- `ethers`: Ethereum blockchain and smart contracts JavaScript API.
- `moralis`: For fast blockchain development.
- `react`: For the UI.

</details>

<hr/>

# **Brief System Overview ⚙️**

The **front end** handles API calls to the **backend** and also contains blockchain interaction code executed through a **MetaMask** provider.

The **backend** contains all the services, controllers, and route structures necessary for the **request-response communication** cycle. Additionally, it uses **Server-Side Events (SSE)** to manage matchmaking and fight mechanics services. Moreover, it can interact with the blockchain via **Alchemy** as a provider.

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
1. Create an `.env` file and make sure you have all the API keys and variables set. Check them here [.env.example](<https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/blob/main/game%20(back-end)/src/.env.example>)
1. Start a Hardhat node.
1. Mint some NFTs using the provided minting script. (blockchainScripts/00-useScript.js)
1. Launch the website on two different browsers or in sessions that don't share cookies. Recommended `Brave`, `Chrome`, `Firefox`.
1. Connect MetaMask to the local Hardhat network using the first two default addresses, one for each browser.
1. Run the server file.
1. Start the MongoDB database.

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

## someday...

1. Apply fuzz testing and symbolic analysis in smart contracts.
2. Try to improve manual smart contract tests.
3. Improve routes security type checking in backend.
4. Finish and test frontend, API and backend services.
5. Improve READMEs: intructions for local usage.
6. Try to improve tests' readability.
7. Create the completely decentralized trustless version of BuddyFighters!

---

## **License 📎**

MIT

---

> GitHub [@CarlosAlegreUr](https://github.com/CarlosAlegreUr)
