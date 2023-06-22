<h1 align="center">
  <br>
  <a><img src="https://image.shutterstock.com/image-photo/pattaya-thailand-2-sep-2016-600w-477402835.jpg" width="200"></a>
  <br>
  BuddyFighters (NOT FINISHED, DON'T USE)
  <br>
</h1>
  <a src="https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/tree/main "> <h3 align="center"> PLAY IN WEB! (not deployed yet) <H3> </a>
<hr>

<h4 align="center">A figthing game on the browser using NFT techonlogy that can be played in EVM compatible blockchains.</h4>

# Index

- Special thanks.
- Video using the app.
- What offical production code can handle.
- How the application works?
- How to use locally.
- Project Structure (so far).
- Pakcages and technologies used.
- License.

<hr/>

## Special thanks

Thanks <a href="https://twitter.com/aonsager" target="_blank"> @aonsager </a> for <a href="https://twitter.com/charlescheerfu1/status/1546925876494929927" target="_blank"> allowing </a> me to use his images.

Creator of => <a href="https://pokemon.alexonsager.net/" target="_blank"> https://pokemon.alexonsager.net/ </a>

Source of the pokemon fusions images used in this project.
<br>
<a><img src="https://images.alexonsager.net/pokemon/fused/34/34.103.png" width="75"></a>
<img src="https://images.alexonsager.net/pokemon/fused/25/25.77.png" width="75"></a>
<img src="https://images.alexonsager.net/pokemon/fused/78/78.132.png" width="75"></a>
<img src="https://images.alexonsager.net/pokemon/fused/43/43.34.png" width="75"></a>
<img src="https://images.alexonsager.net/pokemon/fused/150/150.22.png" width="75"></a>
<img src="https://images.alexonsager.net/pokemon/fused/84/84.73.png" width="75"></a>

<hr>

## Video using the app

<hr>

## How the application works?

Backend is managed by some business that owns the
NFT collection and provides the game mechanics.

Backend takes charge of:

- Creates nfts with random Chainlink generated trait values. And then gives permision the client to mint the NFT with the values that have been generated. Like this client can be sure it's NFT was truly random and creates more trust in the business.

- Executes the matchmaking and fighting logic when 2 players are looking for or in a fight.

- If conditions met, allows clients to improve their
  nft's traits but does not call that function on the blockchain. Client has to call it. This is done to create more reliability in the business because clients
  can check the URI points or is the desired data and then they themselves call the update function from the front-end.

Front-end takes charge of:

- Abstract all the blockchain interactions or API backend interactions with simple user friendly buttons.

<hr>

## What offical production code can handle

This is a personal portfolio project, so the public website and backend only handle 2 fights at the same time and can only handle 5 accounts. This is done so I
can host the project for free.

<hr/>

## How To Use Locally

> **Note:**
> Project developed and tested only in Linux Ubuntu 20.04. Haven't tried if compatible with other OS.

> **Note:**
> Web developed and tested using Brave browser.

<br>

To play locally in your own blockchain, you'll need [Git](https://git-scm.com) and [Yarn](https://github.com/yarnpkg/berry), though you can use [Npm](https://www.npmjs.com/) to install dependencies if you like.

From your command line:

```bash
# Clone this repository
$ git clone https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame.git

# Install all the dependencies of package.json
$ cd ./game\ \(back-end\)/src/
$ yarn install

# Run the blockchain on ./game\ \(back-end\)/src/
$ yarn hardhat node

# Use the mint script to mint some nfts.
$ yarn hardhat run ./scripts/mint.js

# You can buy them now in Opensea for Testnets
(link here)

# Open another terminal and go to /website-game (front-end)/
$ cd ../../website-game\ \(front-end\)/

# Install all the dependencies in package.json
$ yarn install

# Run NexJs dev mode
$ yarn dev

# Connect to your wallet and add your localhost blockchain to it.

# Connect with 2 different accounts in different browsers

# Start fighting and enjoy!

ENJOY
```

<hr>

## Project Structure (so far)

- game(back-end)/src : all the code that runs the project in the backend servers.
- website-game(front-end): all the code that conforms
  the website that interact with the backend.

<hr>

## Pakcages and technologies used.

This software uses the following packages and technologies:

TODO TOWRITE

<hr>

## License

MIT

---

> GitHub [@CarlosAlegreUr](https://github.com/CarlosAlegreUr)
